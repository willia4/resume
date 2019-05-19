import * as yaml from 'js-yaml';
import * as axios from 'axios';
import * as Handlebars from 'handlebars';

type ResumeDictionaryType = { [name: string]: string };
type NodeType = "content" | "title";

interface IResumeSection {
  title?: string | string[];
  subtitle?: string | string[];
  headline?: string | string[];
  content?: string | ResumeDictionaryType;
  annotation?: string;
  extraClass?: string;

  subsections?: IResumeSection[];
}

interface IResume {
  header: IResumeSection;
  sections: IResumeSection[];
}

interface IHandlebarsContentObject {
  sections: IHandlebarsContentSection[];
}

interface IHandlebarsContentSection {
  title?: string;
  content?: string;
  annotation?: string;
  extraClass?: string;
}

function getTemplateSource(): string {
	return document.getElementById('content-template').innerHTML;
}

function renderDictionaryText(dictionaryText: ResumeDictionaryType): string {
  if (!dictionaryText) { return ''; }
  let r = '';

  r += '<ul>';
  for(let k in dictionaryText) {
    if (dictionaryText.hasOwnProperty(k)) {
      const el = `<li><span class="dictionary-key">${k}</span> &mdash; ${dictionaryText[k]}</li>`;
      r += `${el}\n`;
    }
  }
  r += '</ul>';

  return r;
}

function renderResumeStringAsHtml(s: string | string[] | ResumeDictionaryType, nodeType: NodeType = "content"): string {
  if (!s) { return ''; }
  
  if (typeof(s) === 'string' && (s as string).indexOf('\n\n') < 0) {
    return s;
  }

  if (typeof(s) === 'string' && s.indexOf('\n\n') >= 0) { 
    return s.split('\n\n')
      .map(p => `<p>${p}</p>`)
      .join('\n\n'); 
  }
  
  if (Array.isArray(s) && nodeType === "content") { 
    return "<ul>\n" + s.map(listItem => `<li>${listItem}</li>`).join("\n") + "</ul>\n";
  }

  if (Array.isArray(s) && nodeType === "title") { 
    return s.join('<br/>');
  }

  return renderDictionaryText(s as ResumeDictionaryType);
}

function renderSubsectionAsHtml(subsection: IResumeSection): string {
  let r = '';
  if (subsection.title || subsection.subtitle) {
    r += '<header class="content-header">\n';
    if (subsection.title) { 
      r += `<div class="section-title">${renderResumeStringAsHtml(subsection.title)}</div>\n`;
    }
    if (subsection.subtitle) {
      r += `<div class="section-subtitle">${renderResumeStringAsHtml(subsection.subtitle, "title")}</div>\n`;
    }
    r += '</header>\n';
  }

  if (subsection.headline) {
    r += `<header class="content-detail-header">${renderResumeStringAsHtml(subsection.headline)}</header>\n`;
  }

  if (subsection.content) {
    r += renderResumeStringAsHtml(subsection.content);
  }

  // there's no where to hang an extra-class on so we ignore this field for now
  // there's no where to hang an annotation on so we ignore this field for now
  return r;
}

function renderHandlebarsSection(section: IResumeSection): IHandlebarsContentSection {
  let r: IHandlebarsContentSection = {};

  if (section.title) { r.title = renderResumeStringAsHtml(section.title); }

  // unconditionally set r.content to some string (possibly the empty string) so we have something to 
  // append subsections to if needed
  r.content = renderResumeStringAsHtml(section.content);

  if (section.subsections) {
    section.subsections.forEach(s => { r.content += `\n\n${renderSubsectionAsHtml(s)}`; });
  }

  if (section.annotation) { r.annotation = renderResumeStringAsHtml(section.annotation); }
  if (section.extraClass) { r.extraClass = section.extraClass; }

  return r;
}

function getElementsAsArray(selector: string): HTMLElement[] {
	const elements: NodeListOf<HTMLElement> = document.querySelectorAll(selector);

	return Array.prototype.slice.call(elements);
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

  const annotationElements = getElementsAsArray('.resume-annotation');
	annotationElements.forEach(function (el) {
		el.style.display = newDisplay;
	});

	evt.preventDefault();
}

export function buildPageFromYaml() {
  const templateSource = getTemplateSource();
  let template = Handlebars.compile(templateSource);

  axios.default.get('/resume.yaml')
    .then((response) => {
      return yaml.load(response.data) as IResume
    })
    .then((resume) => {
      let templateObject: IHandlebarsContentObject = {
        sections: []
      };

      templateObject.sections = resume.sections.map(s => renderHandlebarsSection(s));

      if (resume.header) {
        templateObject.sections.splice(0, 0, renderHandlebarsSection(resume.header));
      }
      

      document.getElementById('container').innerHTML = template(templateObject);
      document.querySelector("#annotations-toggle a").addEventListener('click', annotationToggleHandler);
    })
} 