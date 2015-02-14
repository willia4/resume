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

		function annotationToggleHandler() {
			var state = this.getAttribute("data-state"),
				annotations = document.querySelectorAll(".resume-annotation"),
				newDisplay;

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

			annotations.forEach(function (el, i) {
				el.style.display = newDisplay;
			});
		}
		document.querySelector("#annotations-toggle a").addEventListener('click', annotationToggleHandler);
	}

	if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', buildPage);	
	}
	else if(document.onreadystatechange)
	{
		document.onreadystatechange = function() {
			if(document.readyState == "complete") {
				alert("IE");
				//IE8 fallback
				//TODO
			}
		}
	}
	
})();