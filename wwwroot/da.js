import { loadModel } from './viewer.js';
import { getParamsPanel } from './paramsPanel.js';

export async function initDA(fileVersionId, hubId, projectId, folderId, fileItemId, fileName, viewer) {
  const paramsPanel = getParamsPanel(viewer);
  paramsPanel.removeAllProperties();
  
  console.log(fileName);
  console.log(fileVersionId);
  console.log(fileItemId);
  console.log(hubId);
  console.log(projectId);
  console.log(folderId);

  function wait(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  window.getFilerUrn = async (_projectId, _folderId, _fileName) => {
    while (true) {
      try {
        const res = await fetch(`/api/hubs/${hubId}/projects/${_projectId}/folders/${_folderId}/files/${_fileName}`);

        const fileUrn = await res.json();

        return fileUrn;
      } catch (err) {
        console.error(err);
        await wait(1000);
      }
    }
  }

  window.startFetchParams = async (_hubId, _fileItemId) => {
    _hubId = _hubId || hubId;
    _fileItemId = _fileItemId || fileItemId;

    const res = await fetch(`/api/da/${_hubId}/${_fileItemId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: "{}"
    });
    const workItem = await res.json();

    checkFetchParamsStatus(workItem.id);
  }

  async function checkFetchParamsStatus(workItemId) {
    const res = await fetch(`/api/da/${workItemId}`);

    const workItem = await res.json();

    if (workItem.status === 'pending' || workItem.status === 'inprogress') {
      await wait(3000);
      checkFetchParamsStatus(workItemId);
      
      return;
    }

    if (workItem.status === 'success') {
      console.log('Fetching params completed successfully: ' + workItem.reportUrl);

      const res = await fetch(workItem.reportUrl);
      const report = await res.json();

      console.log(report);

      const result = JSON.parse(report.result);
      console.log(result);

      showParameters(paramsPanel, result.before);

      return;
    }

    if (workItem.status.startsWith('failed')) {
      console.log('Fetching params failed: ' + workItem.reportUrl);
      
      return;
    }
  }

  window.startUpdate = async (_hubId, _fileItemId, _params) => {
    _hubId = _hubId || hubId;
    _fileItemId = _fileItemId || fileItemId;

    const res = await fetch(`/api/da/${_hubId}/${_fileItemId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(_params)
    });
    const workItem = await res.json();

    checkUpdateStatus(workItem.id);
  }

  async function checkUpdateStatus(workItemId) {
    const res = await fetch(`/api/da/${workItemId}`);

    const workItem = await res.json();

    if (workItem.status === 'pending' || workItem.status === 'inprogress') {
      await wait(3000);
      checkUpdateStatus(workItemId);
      
      return;
    }

    if (workItem.status === 'success') {
      console.log('Updating params completed successfully: ' + workItem.reportUrl);

      const res = await fetch(workItem.reportUrl);
      const report = await res.json();

      console.log(report);

      const result = JSON.parse(report.result);
      console.log(result);

      const fileUrn = await window.getFilerUrn(projectId, folderId, result.newFileName);
      const fileBase64Urn = window.btoa(fileUrn).replace(/=/g, '').replace(/\//g, '_');
      console.log(fileUrn);
      console.log(fileBase64Urn);

      while (true) {
        try {
          const model = await loadModel(viewer, fileBase64Urn);

          console.log(model);

          return;
        } catch (err) {
          console.error(err);
          await wait(1000);
        }
      }
    }

    if (workItem.status.startsWith('failed')) {
      console.log('Updating params failed: ' + workItem.reportUrl);
      
      return;
    }
  }

  window.startFetchParams(hubId, fileItemId);
}

function showParameters(paramsPanel, params) {
  paramsPanel.removeAllProperties();

  for (const key of Object.keys(params)) {
    paramsPanel.addProperty(key, params[key]);
  }

  paramsPanel.setVisible(true);

  paramsPanel.updateDesignButton.onclick = async () => {
    console.log('Update design button clicked');

    const params = paramsPanel.getProperties();

    window.startUpdate(null, null, params);
  }
}