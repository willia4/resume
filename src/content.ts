import * as Handlebars from 'handlebars';

interface IContentSection {
	title: string;
	content: string;
	annotation: string | undefined;
	extraClass: string;
}

interface IContentObject {
	sections: IContentSection[];
}

function getTemplateSource(): string {
	return document.getElementById('content-template').innerHTML;
}

function getElementsAsArray(selector: string): HTMLElement[] {
	const elements: NodeListOf<HTMLElement> = document.querySelectorAll(selector);

	return Array.prototype.slice.call(elements);
}

function getAnnotations(): Map<string, string> {
	let annotationElements = getElementsAsArray('resume-annotation');
	let annotations = new Map<string, string>();
	
	//build a hash of annotations so we can easily get the right annotation for a block of content as we build the contentObject
	annotationElements.forEach(function (el) {
		const key = el.getAttribute("data-for");
		const content = el.innerHTML || el.innerText; //I've seen innerHTML be undefined for these elements on some browsers, so have a fail-safe

		annotations.set(key, content);
	});

	return annotations;
}

function annotationToggleHandler(evt: Event) {
	const self = this as HTMLElement;
	const state = this.getAttribute("data-state");
	
	let newDisplay: string;

	if (state === "shown") {
		this.firstChild.nodeValue = "show annotations";
		this.setAttribute("data-state", "hidden");

		newDisplay = "none";
	} else {
		this.innerHTML = "hide annotations";
		this.setAttribute("data-state", "shown");

		newDisplay = "block";
	}

	//I toyed with the idea of using a CSS fade transition when toggling annotations but with annotations hidden,
	//the layout of the resume proper should become a little tighter (since some of the annotations can be long).
	//fading out and then abruptly re-laying-out the text on the left would be weird. So just set display:none
	//and be done with it.
	const annotationElements = getElementsAsArray('.resume-annotation');
	annotationElements.forEach(function (el) {
		el.style.display = newDisplay;
	});

	evt.preventDefault();
}

export function buildPage() {
	const templateSource = getTemplateSource();
	let template = Handlebars.compile(templateSource);
	
	let annotations = getAnnotations();

	// the object that will be passed to the template
	let contentObject: IContentObject = {
		sections: []
	};

	const contentElements = getElementsAsArray('resume-content');
	contentObject.sections = contentElements.map((el) => {
		const title = el.getAttribute("data-title");
		const extraClass = el.getAttribute("data-extra-class");
		const content = el.innerHTML || el.innerText; //I've seen innerHTML be undefined for these elements on some browsers, so have a fail-safe
		let annotation: string = null;

		if (annotations.has(title)) {
			annotation = annotations.get(title);
		}

		return {
			title: title, 
			content: content,
			annotation: annotation,
			extraClass: (extraClass ? extraClass : "")
		};
	});
	
	document.getElementById('container').innerHTML = template(contentObject);

	document.querySelector("#annotations-toggle a").addEventListener('click', annotationToggleHandler);
}

