var slidingSidebarContainers = document.getElementsByClassName('sliding-sidebar-container');

// Toggle sidebar open or closed
function toggleSlidingSidebar(containerId, newState) {
  let sidebarContainer = document.getElementById(containerId);
  let state = sidebarContainer.dataset.state || 'open';
  if (!newState) {
    newState = (state == 'open') ? 'closed' : 'open';
  }
  sidebarContainer.dataset.state = newState;
}

// Set up sidebar containers
for (const sidebar of slidingSidebarContainers) {
  let sidebarContainer = sidebar;

  // Set the default state of the sidebar based on the window size
  if (window.innerWidth < 800) {
    sidebar.dataset.state = 'closed';
  } else {
    sidebar.dataset.state = 'open';
  }

  // Add an overlay background for dimming content behind the sidebar
  let sscOverlayBackground = document.createElement('div');
  sscOverlayBackground.classList.add('ssc-overlay-background');
  sscOverlayBackground.addEventListener('click', function(e) {
    toggleSlidingSidebar(this.parentNode.id, 'closed');
  });
  sidebarContainer.appendChild(sscOverlayBackground);
}
