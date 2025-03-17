let paramsPanel = null;

class ParamsPanel extends Autodesk.Viewing.UI.PropertyPanel {
    updateDesignButton = null;

    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;

        this.updateDesignButton = document.createElement('button');
        this.updateDesignButton.innerText = 'Update Design';

        this.footer.appendChild(this.updateDesignButton);
    }

    getProperties() {
        let result = {};
        const properties = paramsPanel.container.getElementsByClassName('expanded property'); 
        for (const property of properties) {
            const key = property.getElementsByClassName('property-name')[0].innerText;
            const value = property.getElementsByClassName('property-value')[0].innerText;
            console.log(key, value);
            result[key] = value;
        }
        return result;
    }

    onPropertyClick(property, event) {
        console.log(property, event);

        const target = event.target;

        if (!target.classList.contains('property-value')) 
            return;

        const editBox = document.createElement('input');
        editBox.value = event.target.innerText;
        editBox.style.position = 'relative';
        target.innerHTML = '';
        target.appendChild(editBox);
        editBox.focus();

        editBox.onblur = () => {
            target.innerHTML = editBox.value;
        }
    }
}

export function getParamsPanel(viewer) {
    if (paramsPanel) 
        return paramsPanel;

    paramsPanel = new ParamsPanel(viewer, viewer.container, 'paramsPanel', 'Parameters');

    return paramsPanel;
}

