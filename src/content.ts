import * as Handlebars from 'handlebars';

(function () {
	function buildPage() {
		var templateSource = document.getElementById('content-template').innerHTML,
			template = Handlebars.compile(templateSource),
			annotationElements: NodeListOf<HTMLElement>,
			annotations : { 
				[key: string]: any 
			} = {} ,
			contentElements: NodeListOf<HTMLElement>,
			contentObject: { sections: any[] };

		//the object that will be passed to the template
		contentObject = {
			sections: []
		}

		annotationElements = document.querySelectorAll('resume-annotation');
		annotationElements = Array.prototype.slice.call(annotationElements); //convert the NodeList to an array

		//build a hash of annotations so we can easily the right annotation for a block of content as we build the contentObject
		annotationElements.forEach(function (el) {
			var key = el.getAttribute("data-for"),
				content = el.innerHTML || el.innerText; //I've seen innerHTML be undefined for these elements on some browsers, so have a fail-safe

			annotations[key] = content;
		});

		contentElements = document.querySelectorAll('resume-content');
		contentElements = Array.prototype.slice.call(contentElements); //convert the NodeList to an array

		contentElements.forEach(function (el, i) {
			var title = el.getAttribute("data-title"),
        extraClass = el.getAttribute("data-extra-class"),
				content = el.innerHTML || el.innerText, //I've seen innerHTML be undefined for these elements on some browsers, so have a fail-safe
				annotation = null;

			if (annotations.hasOwnProperty(title)) {
				annotation = annotations[title];
			}

			contentObject.sections.push({
				title: title, 
				content: content,
				annotation: annotation,
        extraClass: (extraClass ? extraClass : "")
			});
		});

		document.getElementById('container').innerHTML = template(contentObject);

		function annotationToggleHandler(evt: Event) {
			var state = this.getAttribute("data-state"),
				annotations: NodeListOf<HTMLElement> = document.querySelectorAll(".resume-annotation"),
				newDisplay: string;

			annotations = Array.prototype.slice.call(annotations); //convert the NodeList to an array

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
			annotations.forEach(function (el, i) {
				el.style.display = newDisplay;
			});

			evt.preventDefault();
		}
		document.querySelector("#annotations-toggle a").addEventListener('click', annotationToggleHandler);
	}

	//consider a browser "modern" if it supports addEventListener. Provide a fallback for other browsers. 
	if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', buildPage);	
	}
	else //for a "non-modern" browser, fall back to displaying the text file. 
	{
		document.getElementsByTagName("body")[0].innerHTML = 	'<body>This resume is available in the following formats: ' + 
											 					'<ul>' +
											 					'<li><a href="james_williams_resume.pdf">PDF</a></li>' +
											 					'<li><a href="james_williams_resume.txt">Plain Text</a></li>' +
											 					'</ul></body>'
	}
	
})();