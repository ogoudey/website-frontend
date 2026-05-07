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
        'background-color': '#3b82f6',
        'label': 'data(label)',
        'color': '#111',
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': 12,
        'width': 40,
        'height': 40
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
    },

    // Example style for grouped/subgraph nodes
    {
      selector: ':parent',
      style: {
        'background-opacity': 0.1,
        'background-color': '#888',
        'border-color': '#666',
        'border-width': 2,
        'padding': 20
      }
    }
  ],

  layout: {
    name: 'cose'
  }
});

///////////////////////////////////////////////////////////
// 2. Fetch graph data from API
///////////////////////////////////////////////////////////

function convertToCytoscapeElements(graphData) {

  const nodeElements = graphData.nodes.map(node => ({
    data: {
      id: String(node.id),
      label: node.label
    }
  }));

  const edgeElements = graphData.edges.map(edge => ({
    data: {
      id: String(edge.id),
      source: String(edge.source),
      target: String(edge.target),
      weight: edge.weight
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