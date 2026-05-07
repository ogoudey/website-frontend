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
      style: { 'background-color': '#534AB7', 'color': '#fff' }
    },
    {
      selector: 'node[type = "lan"]',
      style: { 'background-color': '#0F6E56', 'color': '#fff' }
    },
    {
      selector: 'node[type = "host"]',
      style: { 'background-color': '#185FA5', 'color': '#fff' }
    },
    {
      selector: 'node[type = "agent"]',
      style: { 'background-color': '#BA7517', 'color': '#fff' }
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

    cy.layout({
      name: 'cose',
      animate: true
    }).run();

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
// 6. Node interaction
///////////////////////////////////////////////////////////

cy.on('tap', 'node', (event) => {
  const node = event.target;

  console.log('Clicked node:', node.data());

  alert(`Node: ${node.data().label}`);
});

///////////////////////////////////////////////////////////
// 7. Initial load
///////////////////////////////////////////////////////////

loadGraph();