class CustomPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, container, id, title, options) {
        super(container, id, title, options);
        this.viewer = viewer;
        this.container.classList.add('custom-palette');
  
    }

    
}