(function () {
	function buildPage() {
		var templateSource = document.getElementById('content-template').innerHTML,
			template = Handlebars.compile(templateSource),
			annotationElements,
			annotations = {},
			contentElements,
			contentObject;

		contentObject = {
			sections: []
		}

		annotationElements = document.querySelectorAll('resume-annotation');
		annotationElements = Array.prototype.slice.call(annotationElements); //convert the NodeList to an array

		annotationElements.forEach(function (el, i) {
			var key = el.getAttribute("data-for"),
				content = el.innerHTML || el.innerText;

			annotations[key] = content;
		});

		contentElements = document.querySelectorAll('resume-content');
		contentElements = Array.prototype.slice.call(contentElements); //convert the NodeList to an array

		contentElements.forEach(function (el, i) {
			var title = el.getAttribute("data-title"),
				content = el.innerHTML || el.innerText,
				annotation = null;

			if (annotations.hasOwnProperty(title)) {
				annotation = annotations[title];
			}

			contentObject.sections.push({
				title: title, 
				content: content,
				annotation: annotation
			});
		});

		document.getElementById('container').innerHTML = template(contentObject);
	}

	if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', buildPage);	
	}
	else if(document.onreadystatechange)
	{
		document.onreadystatechange = function() {
			if(document.readyState == "complete") {
				//IE8 fallback
				//TODO
			}
		}
	}
	
})();