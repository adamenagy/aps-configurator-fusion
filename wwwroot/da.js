export async function initDA(fileVersionId, hubId, projectId, fileItemId, fileName) {
  console.log(fileName);
  console.log(fileVersionId);
  console.log(fileItemId);
  console.log(hubId);
  console.log(projectId);



}

window.runWorkItem = async (hubId, fileItemId, params) => {
  const res = await fetch(`/api/da/${hubId}/${fileItemId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  const workItem = await res.json();

  checkWorkItemStatus(workItem.id);
}

async function checkWorkItemStatus(workItemId) {
  const res = await fetch(`/api/da/${workItemId}`);

  const workItem = await res.json();

  if (workItem.status === 'pending' || workItem.status === 'inprogress') {
    setTimeout(async () => {
      checkWorkItemStatus(workItemId)
    }, 3000);
    return;
  }

  if (workItem.status === 'success') {
    console.log('Work item completed successfully: ' + workItem.reportUrl);

    const res = await fetch(workItem.reportUrl);
    const report = await res.json();

    console.log(report);

    return;
  }

  if (workItem.status.startsWith('failed')) {
    console.log('Work item failed: ' + workItem.reportUrl);
    return;
  }
}