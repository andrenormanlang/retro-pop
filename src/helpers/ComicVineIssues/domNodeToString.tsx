interface DomNodeAttributes {
	[key: string]: string | undefined;
	href?: string;
  }

  export interface DomNodeOrChild {
	type: string;
	data?: string;
	name?: string;
	attribs?: DomNodeAttributes;
	children?: DomNodeOrChild[];
  }


  const domNodeToString = (domNode: DomNodeOrChild): string => {
	if (domNode.type === 'text') {
	  return domNode.data || '';
	}

	// Check if name exists before using it
	let nodeString = domNode.name ? `<${domNode.name}` : '';

	if (domNode.attribs) {
	  for (const [key, value] of Object.entries(domNode.attribs)) {
		nodeString += ` ${key}="${value}"`;
	  }
	}
	nodeString += '>';

	if (domNode.children) {
	  for (const child of domNode.children) {
		// Recursive call for children
		// Make sure to pass only valid DomNode objects to domNodeToString
		if ('name' in child && child.name) {
		  nodeString += domNodeToString(child);
		}
	  }
	}

	// Append closing tag only if name is defined
	if (domNode.name) {
	  nodeString += `</${domNode.name}>`;
	}

	return nodeString;
  }

export default domNodeToString;
