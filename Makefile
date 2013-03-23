all: output/local_resume.html output/index.html output/james_williams_resume.txt output/james_williams_resume.pdf

clean: 
	@rm output/*.html 2>/dev/null || true
	@rm output/*.txt 2>/dev/null || true
	@rm output/*.pdf 2>/dev/null || true
	@rm output/*.docx 2>/dev/null || true
	@rm output/*.pd 2>/dev/null || true

output/local_css.pd: assets/resume_css.pd
	cat assets/resume_css.pd | sed 's/%%BODY_FONT%%/\"Myriad Pro\"/g' | sed 's/%%HEADER_FONT%%/\"Le Monde Sans Std\"/g' | sed 's/%%LOGO_FONT%%/\"Futura\"/g' > output/local_css.pd

output/remote_css.pd: assets/resume_css.pd
	cat assets/resume_css.pd | sed 's/%%BODY_FONT%%/myriad-pro-1,myriad-pro-2,Helvetica,Arial/g' | sed 's/%%HEADER_FONT%%/lemonde-sans-1,lemonde-sans-2,helvetica,verdana,sans-serif/g' | sed 's/%%LOGO_FONT%%/futura-pt-1,futura-pt-2,helvetica,verdana,sans-serif/g' > output/remote_css.pd

output/local_resume.html: output/local_css.pd james_williams_resume.md assets/download_links.pd assets/html_comments.pd assets/html5.pd
	pandoc --template=assets/html5.pd --include-in-header=assets/html_comments.pd --include-in-header=output/local_css.pd --include-after-body=assets/download_links.pd --write=html5 --standalone --smart -o output/local_resume.html james_williams_resume.md

output/index.html: output/remote_css.pd james_williams_resume.md assets/download_links.pd assets/html_comments.pd assets/html5.pd assets/script_header.pd
	pandoc --template=assets/html5.pd --include-in-header=assets/html_comments.pd --include-in-header=output/remote_css.pd --include-in-header=assets/script_header.pd --include-after-body=assets/download_links.pd --write=html5 --standalone --smart -o output/index.html james_williams_resume.md

output/james_williams_resume.pdf: output/local_resume.html
	wkhtmltopdf --title "Resume of James Williams" --print-media-type output/local_resume.html output/james_williams_resume.pdf

output/james_williams_resume.txt: james_williams_resume.md
	pandoc --ascii --write=plain --standalone --smart -o output/james_williams_resume_temp.txt james_williams_resume.md
	gawk 'sub("$$", "\r")' output/james_williams_resume_temp.txt > output/james_williams_resume.txt
	rm output/james_williams_resume_temp.txt

output/james_williams_resume.docx: james_williams_resume.md
	echo This is experimental and should not be shared!
	pandoc --standalone --smart -o output/james_williams_resume.docx james_williams_resume.md

.PHONY: deploy

deploy: output/index.html output/james_williams_resume.pdf output/james_williams_resume.txt
	scp output/index.html willia4@willia4.me:/www/jameswilliams.me/resume/index.html
	scp output/james_williams_resume.pdf willia4@willia4.me:/www/jameswilliams.me/resume/james_williams_resume.pdf
	scp output/james_williams_resume.txt willia4@willia4.me:/www/jameswilliams.me/resume/james_williams_resume.txt
	scp james_williams_resume.md willia4@willia4.me:/www/jameswilliams.me/resume/james_williams_resume.md
