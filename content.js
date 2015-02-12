document.addEventListener("DOMContentLoaded", function(evt) {
	var templateSource = document.getElementById("content-template").innerHTML,
		template = Handlebars.compile(templateSource),
		content;

	content = {
		sections: [
			{
				title: "Summary"
			},
			{
				title: "Objective"
			}
		]
	};

	document.getElementById("container").innerHTML = template(content);
});