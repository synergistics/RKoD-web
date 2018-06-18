const jquery = require('jquery')
const cytoscape = require('cytoscape')
const edgehandles = require('cytoscape-edgehandles')
const contextMenus = require('cytoscape-context-menus')
const clipboard = require('cytoscape-clipboard')
const undoRedo = require('cytoscape-undo-redo')

cytoscape.use(edgehandles)
clipboard(cytoscape, jquery)
undoRedo(cytoscape)
contextMenus(cytoscape, jquery)

let container = document.getElementById('cy')

let cy = cytoscape({
    container,

    elements: [ // list of graph elements to start with
        { data: { id: 'n0', state: 1} },
        { data: { id: 'n1', state: 0} },
        { data: { id: 'n2', state: 0} },

        { data: {source: 'n0', target: 'n0'} },
        { data: {source: 'n1', target: 'n1'} },
        { data: {source: 'n2', target: 'n2'} },
        { data: {source: 'n0', target: 'n1'} },
        { data: {source: 'n1', target: 'n2'} },
        { data: {source: 'n2', target: 'n0'} },
    ],

    style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                // 'label': 'data(id)'
                // 'label': ''
            }
        },

        {
            selector: 'edge',
            style: {
                'width': 3,
                'curve-style': 'bezier', // for rendering arrows
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle'
            }
        },
        {
            selector: 'node:selected',
            style: {
                'border-color': '#a3c1ad',
                'border-width': '4px'
            }
        },
        {
            selector: 'edge:selected',
            style: {
                'curve-style': 'bezier', // for rendering arrows
                'line-color': '#a3c1ad',
                'target-arrow-color': '#a3c1ad',
                'target-arrow-shape': 'triangle'
            }
        },
        {
            selector: '.on',
            style: {
                'background-color': '#333'
            }
        },

        {
            selector: '.off',
            style: {
                'background-color': '#ddd' 
            }
        },
        {
            selector: '.eh-handle',
            style: {
                'background-color': '#bbb',
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 6, // makes the handle easier to hit
                'border-opacity': 0
            }
        },
        {
            selector: '.eh-hover',
            style: {}
        },
        {
            selector: '.eh-source',
            style: {}
        },
        {
            selector: '.eh-target',
            style: {}
        },
        {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': '#bbb',
                'line-color': '#bbb',
                'target-arrow-color': '#bbb',
                'source-arrow-color': '#bbb'
            }
        }
    ],

    // the docs say I shouldn't do this and that I probably just have a nonstandard touchpad
    wheelSensitivity: 0.1,
});

let eh = cy.edgehandles({
    loopAllowed: (node) => true,

})

// TODO: Get rid of global variable mousePos
let mousePos = {}

cy.on('tapdrag', (event) => {
    mousePos = event.position
})

let ur = cy.undoRedo({ undoableDrag: true })
let cb = cy.clipboard({
    afterPaste: (eles) => {
        // console.log('hi')
        let elePos = eles.position() 
        eles.shift({
            x: mousePos.x - elePos.x,
            y: mousePos.y - elePos.y
        })
    }
})


// cy.on('paste', (event) => console.log(event) )

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.target.nodeName == 'BODY') {
        if (event.which === 67) { // CTRL + C = copy
            cb.copy(cy.$(':selected'))
        } 
        else if (event.which === 86) { // CTRL + V = paste
            cb.paste()
            
        } 
        else if (event.which === 65) { // CTRL + A = select all
            cy.elements().select() 
            event.preventDefault()
        }
        else if (event.which === 90) {
            if (event.shiftKey) {
                 
            } 
        }
    }

    else if (event.which === 46) { // delete
            cy.remove(cy.$(':selected'))
    }
})

var layoutOptions = {
    name: 'cose',

    // Called on `layoutready`
    ready: function(){},

    // Called on `layoutstop`
    stop: function(){},

    // Whether to animate while running the layout
    // true : Animate continuously as the layout is running
    // false : Just show the end result
    // 'end' : Animate with the end result, from the initial positions to the end positions
    animate: false,

    // Easing of the animation for animate:'end'
    animationEasing: undefined,

    // The duration of the animation for animate:'end'
    animationDuration: undefined,

    // A function that determines whether the node should be animated
    // All nodes animated by default on animate enabled
    // Non-animated nodes are positioned immediately when the layout starts
    animateFilter: function ( node, i ){ return true; },

    // The layout animates only after this many milliseconds for animate:true
    // (prevents flashing on fast runs)
    animationThreshold: undefined,

    // Number of iterations between consecutive screen positions update
    // (0 -> only updated on the end)
    refresh: 20,

    // Whether to fit the network view after when done
    fit: true,

    // Padding on fit
    padding: 200,

    // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    boundingBox: undefined,

    // Excludes the label when calculating node bounding boxes for the layout algorithm
    nodeDimensionsIncludeLabels: false,

    // Randomize the initial positions of the nodes (true) or use existing positions (false)
    randomize: false,

    // Extra spacing between components in non-compound graphs
    componentSpacing: 40,

    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: function( node ){ return 2048; },

    // Node repulsion (overlapping) multiplier
    nodeOverlap: 4,

    // Ideal edge (non nested) length
    idealEdgeLength: function( edge ){ return 32; },

    // Divisor to compute edge forces
    edgeElasticity: function( edge ){ return 32; },

    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 1.2,

    // Gravity force (constant)
    gravity: 1,

    // Maximum number of iterations to perform
    numIter: 1000,

    // Initial temperature (maximum node displacement)
    initialTemp: 1000,

    // Cooling factor (how the temperature is reduced between consecutive iterations
    coolingFactor: 0.99,

    // Lower temperature threshold (below this point the layout will end)
    minTemp: 1.0,

    // Pass a reference to weaver to use threads for calculations
    weaver: true
};

let layout = cy.layout( layoutOptions );
layout.start()

let menuOptions = {
    // List of initial menu items
    menuItems: [
      {
        id: 'remove', // ID of menu item
        content: 'remove', // Display content of menu item
        tooltipText: 'remove', // Tooltip text for menu item
        // Filters the elements to have this menu item on cxttap
        // If the selector is not truthy no elements will have this menu item on cxttap
        selector: 'node, edge', 
        onClickFunction: function (event) { // The function to be executed on click
            cy.remove(event.target)
        },
        hasTrailingDivider: true, // Whether the item will have a trailing divider
        coreAsWell: false // Whether core instance have this item on cxttap
      },
      {
        id: 'remove-selected', // ID of menu item
        content: 'remove selected', // Display content of menu item
        tooltipText: 'remove selected', // Tooltip text for menu item
        // Filters the elements to have this menu item on cxttap
        // If the selector is not truthy no elements will have this menu item on cxttap
        selector: 'node, edge', 
        onClickFunction: function (event) { // The function to be executed on click
            cy.remove(cy.$(':selected'))
        },
        hasTrailingDivider: true, // Whether the item will have a trailing divider
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'invert-state', // ID of menu item
        content: 'invert state', // Display content of menu item
        tooltipText: 'invert state', // Tooltip text for menu item
        // Filters the elements to have this menu item on cxttap
        // If the selector is not truthy no elements will have this menu item on cxttap
        selector: 'node', 
        onClickFunction: function (event) { // The function to be executed on click
            let node = event.target
            node.data('state', (node.data('state') + 1) % 2)
        },
        hasTrailingDivider: true, // Whether the item will have a trailing divider
        coreAsWell: false // Whether core instance have this item on cxttap
      },
      {
        id: 'add-node',
        content: 'add node',
        tooltipText: 'add node',
        selector: 'node',
        coreAsWell: true,
        onClickFunction: function (event) {
            cy.add({
                group: 'nodes',
                position: event.position,
                data: { state: 0 }
            })
        }
      },
      {
        id: 'copy',
        content: 'copy',
        tooltipText: 'copy',
        selector: 'node',
        coreAsWell: true,
        onClickFunction: function (event) {
            cb.copy(cy.$(':selected'))
        }
      },
      {
        id: 'paste',
        content: 'paste',
        tooltipText: 'paste',
        selector: 'node',
        coreAsWell: true,
        onClickFunction: function (event) {
            cb.paste()
        }
      },
      {
        id: 'turn-off',
        content: 'turn off',
        tooltipText: 'turn off',
        selector: 'node',
        coreAsWell: true,
        onClickFunction: function (event) {
            cy.$(':selected').forEach((node) => node.data('state', 0))
        }
      }
    ],
    // css classes that menu items will have
    menuItemClasses: [
        // add class names to this list
    ],
    // css classes that context menu will have
    contextMenuClasses: [
        // add class names to this list
    ]
};

let cm = cy.contextMenus(menuOptions)

function setColors() {
    cy.startBatch()
    cy.nodes().forEach(node => {
        if (node.data('state') === 0) {
            node.addClass('off') 
            node.removeClass('on') 
        }
        else if (node.data('state') === 1) {
            node.addClass('on') 
            node.removeClass('off') 
        }
    }) 
    cy.endBatch()
}

function runAutomataStep() {
    let newStates = [] 
    let nodes = cy.nodes()

    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        // select the incoming elements of group node
        let incomers = node.incomers('node');
        let stateChange = incomers.map(inc => inc.data('state')).reduce((a,b) => a + b, 0)
        let newState = (node.data('state') + stateChange) % 2
        newStates.push({ node, newState })
    }

    for (let update of newStates ) {
        update.node.data('state', update.newState) 
    }
}

let counter = 0;
function loop() {
    requestAnimationFrame(loop)
    counter++;

    if (counter % 10 === 0) {
        setColors()
        runAutomataStep()
    }

}

requestAnimationFrame(loop)
