import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import * as logoFile from '../../logo.js';
//import { DatePipe } from '@angular/common';
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  generateExcel(year, dataJSON) {
    //Excel Title, Header, Data
    let title = `BONO ANUAL DE DESEMPEÑO ${year}`;
    let header = ['ID', 'COLABORADOR', 'FECHA EVALUACIÓN', 'EVALUACIÓN', 'BONO', 'SEMÁFORO'];
    let data = [];
    for (let item of dataJSON) {
      data.push( Object.values(item) );
    }
    
    //Create workbook and worksheet
    let workbook = new Workbook();
    workbook.creator = 'NEIXAR CONNECT PLATFORM';
    workbook.created = new Date();
    let worksheet = workbook.addWorksheet(`Evaluación de Desempeño ${new Date().getFullYear()}`);


    //Add Row and formatting
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { name: 'Microsoft Tai Le', family: 4, size: 16, bold: true }
    worksheet.addRow([]);
    let subTitleRow = worksheet.addRow(['Fecha de consulta : ' + moment().format('DD/MM/YYYY')])
    subTitleRow.font = {
      name: 'Microsoft Tai Le',
      color: { argb: 'FF0C204F' },
      size: 10,
      bold: true
    };
    
    worksheet.mergeCells('A1:F2');
    let cells = worksheet.getCell('A1:F2');
    cells.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0C204F' },
      bgColor: { argb: 'FF0000FF' }
    }
    cells.font = {
      name: 'Microsoft Tai Le',
      color: { argb: 'FFFFFFFF' },
      size: 16,
      bold: true
    };
    cells.alignment = { vertical: 'bottom', horizontal: 'center' };
    //Add Image
    let logo = workbook.addImage({
      base64: logoFile.logoBase64,
      extension: 'png',
    });

    worksheet.addImage(logo, {
      tl: { col: 5.2, row: 0.5 },
      br: { col: 6, row: 1.75 }
    });

    //Blank Row 
    worksheet.addRow([]);

    //Add Header Row
    let headerRow = worksheet.addRow(header);
    
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0C204F' },
        bgColor: { argb: 'FF0000FF' }
      }
      cell.font = {
        name: 'Microsoft Tai Le',
        color: { argb: 'FFFFFFFF' },
        size: 10,
        bold: true
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'medium', color: {argb:'FFA5C72B'} }, bottom: { style: 'thin' }, right: { style: 'medium', color: {argb:'FFA5C72B'} } }
    })

    // Add Data and Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);

      row.eachCell( (cell, number)  => {
        cell.font = {
        name: 'Microsoft Tai Le',
        color: { argb: 'FF787878' },
        size: 10
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'medium', color: {argb:'FFA5C72B'} }, bottom: { style: 'thin' }, right: { style: 'medium', color: {argb:'FFA5C72B'} } }
      })
      let saf_id = row.getCell(1);
      let bonus = row.getCell(5);
      let progress = row.getCell(4);
      bonus.numFmt = '$#,##0.00';
      let color = 'FFFFFFFF';
      if ( +progress.value >= 1 && +progress.value < 61 ) color = 'FFFF0000'; // ROJO
      else if ( +progress.value >= 61 && +progress.value < 81 ) color = 'FFFFC000'; // AMARILLO
      else if ( +progress.value >= 81 && +progress.value < 96 ) color = 'FF92D050'; // VERDE CLARO
      else if ( +progress.value >= 96 && +progress.value <= 100 ) color = 'FF00B014'; // VERDE CLARO
  
      saf_id.font = {
        name: 'Microsoft Tai Le',
        color: { argb: 'FF0C204F' },
        size: 10,
        bold: true
      };

      row.getCell(6).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color }
      }
      row.getCell(6).font = {
        name: 'Microsoft Tai Le',
        color: { argb: 'FFFFFFFF' },
        size: 10,
        bold: true
      };
    }

    );
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 20;
    worksheet.addRow([]).getCell(5);


    //Footer Row
    let footerRow = worksheet.addRow(['Este es un documento generado por la plarforma NEIXAR CONNECT.']);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0C204F' }
    };
    footerRow.getCell(1).font = {
      name: 'Microsoft Tai Le',
      color: { argb: 'FFFFFFFF' },
      size: 10,
      bold: true
    };
    footerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    footerRow.getCell(1).border = { top: { style: 'thin', color: {argb:'FF0C204F'} }, left: { style: 'thin', color: {argb:'FF0C204F'} }, bottom: { style: 'thin', color: {argb:'FF0C204F'} }, right: { style: 'thin' , color: {argb:'FF0C204F'}} }

    //Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then( data => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, `Desempeño${year}.xlsx`);
    });

  }
}
