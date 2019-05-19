import { buildPage } from './content'

(function () {
	

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