import { adsk } from "@adsk/fas";

function run() {
  const scriptParameters = JSON.parse(adsk.parameters);
  if (!scriptParameters) throw Error("Invalid parameters provided.");

  const app = adsk.core.Application.get();
  if (!app) throw Error("No asdk.core.Application.");

  adsk.log(`Running script with parameters: ${JSON.stringify(scriptParameters)}`);

  const { hub, folder, file } = getDmObjects(app, scriptParameters.hubId, scriptParameters.fileURN);

  adsk.log(`Setting active hub: ${hub.name}.`);
  app.data.activeHub = hub;

  adsk.log(`Opening document: ${scriptParameters.fileURN}`);
  const doc = app.documents.open(file, true);
  if (!doc) throw Error("Invalid document.");

  const design = doc.products.itemByProductType(
    "DesignProductType",
  ) as adsk.fusion.Design;

  let inputParams = scriptParameters.parameters;

  // Read current design parameters
  const docParams: adsk.fusion.ParameterList = design.allParameters;
  const before = parametersToObject(docParams);
  for (let name in inputParams) {
    // Set parameters that are specified in the inputParams object,
    // and also exist in the design
    const par: adsk.fusion.Parameter | null = docParams.itemByName(name);
    if (par == null) {
      adsk.log(`Parameter "${name}" not found, skipping`);
      delete inputParams.par;
      continue;
    }
    par.expression = inputParams[name];
  }
  const after = parametersToObject(docParams);

  const message = `Change parameters: [${Object.keys(inputParams).map(
    (key) => `(${key}: ${before[key]} => ${after[key]})`,
  )}]`;
  const newDocName = saveDocument(doc, message, folder, scriptParameters.fileSuffix);

  adsk.result = JSON.stringify({ 
    before: before, 
    after: after,
    newFileName: newDocName, 
  });

  while (app.hasActiveJobs) {
    wait(2000);
  }
}

function getDmObjects(app: adsk.core.Application, hubId: string, fileURN: string) {
  const hub = app.data.dataHubs.itemById(hubId);
  if (!hub) throw Error(`Hub not found ${hubId}.`);

  const file = app.data.findFileById(fileURN);
  if (!file) throw Error(`File not found ${fileURN}.`);

  const folder = file.parentFolder;

  return {
    hub,
    folder,
    file,
  };
}

function parametersToObject(parameters: adsk.fusion.ParameterList) {
  let out = {};
  for (let i = 0; i < parameters.count; i++) {
    out[parameters.item(i)!.name] = parameters.item(i)!.expression;
  }
  return out;
}

function wait(ms: number) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < ms) adsk.doEvents();
}

function saveDocument(
  doc: adsk.core.Document,
  message: string,
  destinationFolder: adsk.core.DataFolder,
  fileSuffix: string,
): string | null {
  adsk.log("Saving as new document.");

  const newDocName = `${doc.dataFile.name}-${fileSuffix}`;

  if (
    doc.saveAs(
      newDocName,
      destinationFolder,
      message,
      "",
    )
  ) {
    adsk.log("Document saved successfully.");

    /*
    let fileFound: adsk.core.DataFile | null = null;
    while (fileFound == null) {
      for (const file of destinationFolder.dataFiles.asArray()) {
        if (file.name === newDocName) {
          adsk.log("Found the file: " + file.name);
          fileFound = file;
          break;
        }
      }
    }

    return fileFound;
    */
    return newDocName;
  } else {
    adsk.log("Document failed to save.");
    return null;
  }
}

run();
