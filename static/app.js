///////////////////////////////////////////////////////////
// 1. Create Cytoscape instance
///////////////////////////////////////////////////////////

const cy = cytoscape({
  container: document.getElementById('cy'),

  elements: [],

  style: [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': 12,
        'width': 40,
        'height': 40,
        'background-color': '#888',
        'color': '#111'
      }
    },
    {
      selector: 'node[type = "local_area"]',
      style: { 'background-color': '#534AB7', 'color': '#111' }
    },
    {
      selector: 'node[type = "lan"]',
      style: { 'background-color': '#0F6E56', 'color': '#111' }
    },
    {
      selector: 'node[type = "host"]',
      style: { 'background-color': '#185FA5', 'color': '#111' }
    },
    {
      selector: 'node[type = "agent"]',
      style: { 'background-color': '#BA7517', 'color': '#111' }
    },
    {
      selector: ':parent',
      style: {
        'background-opacity': 0.08,
        'text-valign': 'top',
        'text-halign': 'center',
        'border-width': 2,
        'border-color': '#666',
        'padding': 20
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#999',
        'target-arrow-color': '#999',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      }
    }
  ],

  layout: {
    name: 'cose-bilkent'   // handles compound nodes much better than plain cose
  }
});

// Cytoscape behavior changes
cy.on('tap', 'node', function(evt) {
  const node = evt.target;
  const ancestors = node.ancestors(); // built-in cytoscape method

  let info = `Node: ${node.data('label')} (${node.data('type')})`;
  if (ancestors.length > 0) {
    const path = ancestors.toArray()
      .reverse() // ancestors goes child→root, reverse for root→child
      .map(n => `${n.data('type')}: ${n.data('label')}`)
      .join(' → ');
    info += `\nPath: ${path}`;
  }

  document.getElementById('status').textContent = info;
});

const tooltip = document.getElementById('tooltip');

cy.on('tap', 'node', function(evt) {
  const node = evt.target;
  const ancestors = node.ancestors().toArray().reverse();
  const path = ancestors.map(n => `${n.data('type')}: ${n.data('label')}`).join(' → ');
  const line1 = `${node.data('type')}: ${node.data('label')}`;
  tooltip.textContent = path ? `${path} → ${line1}` : line1;
  tooltip.style.opacity = '1';
});

cy.on('tap', function(evt) {
  if (evt.target === cy) tooltip.style.opacity = '0'; // clicked background = dismiss
});

cy.on('mousemove', function(evt) {
  tooltip.style.left = (evt.originalEvent.clientX + 12) + 'px';
  tooltip.style.top  = (evt.originalEvent.clientY + 12) + 'px';
});

///////////////////////////////////////////////////////////
// 2. Fetch graph data from API
///////////////////////////////////////////////////////////

function convertToCytoscapeElements(graphData) {
  const nodeElements = graphData.nodes.map(node => ({
    data: {
      id: String(node.id),
      label: node.name,
      type: node.type,
      parent: node.parent_id ? String(node.parent_id) : undefined,
      metadata: node.metadata ?? {}
    }
  }));

  const edgeElements = graphData.edges.map(edge => ({
    data: {
      id: 'e' + String(edge.id),
      source: String(edge.source_id),
      target: String(edge.target_id),
      label: edge.label ?? ''
    }
  }));

  return [...nodeElements, ...edgeElements];
}

// Helper for cytoscape post-processing
function collapseSingletons(cy) {
  let changed = true;
  while (changed) {
    changed = false;
    cy.nodes().forEach(node => {
      const children = node.children();
      if (children.length === 1) {
        const child = children[0];
        const grandchildren = child.children();
        if (grandchildren.length === 0) {
          // child is a leaf — move it out, remove the parent
          child.move({ parent: node.data('parent') ?? null });
          cy.remove(node);
          changed = true;
        }
      }
    });
  }
}

async function loadGraph() {
  const status = document.getElementById('status');

  try {
    status.textContent = 'Loading graph...';

    const response = await fetch('/graph');

    if (!response.ok) {
        throw new Error(`Could not get graph: ${response.status}`);
    }

    const graphData = await response.json();

    console.log('Received graph data:', graphData);
    
    const elements = convertToCytoscapeElements(graphData);

    ///////////////////////////////////////////////////////////
    // 3. Replace graph contents
    ///////////////////////////////////////////////////////////

    

    cy.elements().remove();

    cy.add(elements);

    ///////////////////////////////////////////////////////////
    // 4. Run layout
    ///////////////////////////////////////////////////////////

    collapseSingletons(cy);   // <-- here
    cy.layout({ name: 'cose-bilkent' }).run();

    status.textContent = 'Loaded';

  } catch (err) {
    console.error(err);
    status.textContent = `Error: ${err.message}`;
  }
}

///////////////////////////////////////////////////////////
// 5. Event handlers
///////////////////////////////////////////////////////////

document
  .getElementById('reload-btn')
  .addEventListener('click', loadGraph);

///////////////////////////////////////////////////////////
// 7. Initial load
///////////////////////////////////////////////////////////

loadGraph();