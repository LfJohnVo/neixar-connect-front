import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { CurriculumService } from 'src/app/services/sevice.index';
import { NgxSpinnerService } from 'ngx-spinner';
import { images } from '../../utils';
import * as jsPDF from '../../../assets/js/pdf/jspdf.debug.js';
import { GLOBAL } from '../../config';

@Component({
  selector: 'app-curriculum-details',
  templateUrl: './curriculum-details.component.html',
  styles: []
})
export class CurriculumDetailsComponent implements OnInit {

  ispdf: Boolean = false;
  margins = {
    top: 70,
    bottom: 40,
    left: 30,
    width: 550
  };
  backTitle = `url(${images.pdfTitles})`;
  userID: String = '';
  cvData: any;
  base64Img: any;

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public activatedRouter: ActivatedRoute,
    public _cvService: CurriculumService
  ) {
    activatedRouter.params.subscribe(params => {
      if (params["id"]) {
        this.userID = params["id"];
        this.getCurriculum();
      } else {
        this.router.navigateByUrl('/perfil/buscar-cv');
      }
    });
   }

  ngOnInit() {

  }

  toDataURL(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }


  getCurriculum() {
    this.spinner.show();
    this._cvService.getCurriculum(this.userID).subscribe(
      res => {
        this.cvData = res.data;
        // this.toDataURL(`${GLOBAL.urlAPI}/image/${this.cvData.user.img}`, (dataUrl) => {
        //this.toDataURL('http://107.170.254.146:4100/api//image/' + this.cvData.user.img, (dataUrl) => {
        this.toDataURL('http://3.96.32.250:4100/api//image/' + this.cvData.user.img, (dataUrl) => {    
          this.base64Img = dataUrl;
        });
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
      }
    );
  }

  exportToPDF() {
    this.ispdf = true;
    const pdf = new jsPDF('p', 'pt', 'letter');
    pdf.setFont('arial');
    pdf.setFontSize(18);
    pdf.setTextColor(0, 32, 96);
    const specialElementHandlers = {
        '.jobName1' : (element, renderer) => {
            pdf.addImage(images.pdfTitles, 'JPEG', renderer.x, renderer.y, this.margins.width + 15, 30);
            return false;
        },
        '.jobName' : (element, renderer) => {
            pdf.addImage(images.pdfTitles, 'JPEG', renderer.x, renderer.y, this.margins.width + 15, 30);
            return false;
        }
    };

    pdf.fromHTML(document.getElementById('html-2-pdfwrapper'),
    this.margins.left, // x coord
    this.margins.top + 60,
    {
            width: this.margins.width - 30,
            'elementHandlers': specialElementHandlers
    }, (dispose) => {
      this.headerFooterFormatting(pdf, pdf.internal.getNumberOfPages());
    }, this.margins);

    pdf.setDrawColor(175, 196, 63);
    pdf.setLineWidth(2);
    pdf.rect(this.margins.left, 30, 90, 90);
    pdf.addImage(this.base64Img, 'JPEG', this.margins.left + 2, 32, 86, 86);
    pdf.setFontType('bold');
    pdf.setFontSize(14);
    pdf.text(this.margins.left + 100, 90, this.cvData.name);
    pdf.setFontType('normal');
    pdf.setFontSize(12);
    pdf.text(this.margins.left + 100, 110, this.cvData.position);

    pdf.save(`${this.cvData.name.replace(/ /gi, '_')}_CV.pdf`);
  }

  headerFooterFormatting(doc, totalPages) {
    for (let i = totalPages; i >= 1; i--) {
      doc.setPage(i);
      doc.addImage(images.pdfHeader, 'JPEG', this.margins.left, 10, this.margins.width + 10, 60);
      doc.page++;
    }
  }

}
