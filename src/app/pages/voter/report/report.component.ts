import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from 'src/app/services/report.service';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import { endOfMonth } from 'date-fns';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  respone: any = [];
  campdata: any;
  loading = false;
  ranges = { Today: [new Date(), new Date()], 'This Month': [new Date(), endOfMonth(new Date())] };
  reportForm: FormGroup;
  PageIndex = 1;
  isLoadingOne = false;
  filteredData: any = [];
  AllReport = {
    Id: '',
    Mobile_number: '',
    Reply_text: '',
    timestamp: ''
  };
  constructor(private reportService: ReportService, private fb: FormBuilder) {
    this.reportForm = fb.group({
      date_range: [null, Validators.required],

    })
  }

  ngOnInit(): void {
    this.camp_data();
    this.responseData();

  }

  camp_data() {
    this.reportService.getcampdetails().subscribe(async (res: any) => {
      this.campdata = await res.data;
      // console.log(this.campdata);
    });
  }

  responseData() {
    this.reportService.responseData().subscribe(async (res: any) => {
      this.respone = await res.data;
      this.respone = await this.respone.filter((item: any) => item.is_deleted == 0);
      this.respone = await this.respone.sort((a: any, b: any) => {
        return <any>new Date(b.Date) - <any>new Date(a.Date);
      });

      this.respone.forEach((item: any) => {
        item.timestamp = moment(item.timestamp).format('YYYY/MM/DD');
      });
      this.respone.map((item: any) => {
        item.mobile_number = item.mobile_number.slice(2,12)
      });

      for (let i = 0; i < this.respone.length; i++) {
        for (let j = 0; j < this.campdata.length; j++) {
          if (this.respone[i].mobile_number == this.campdata[j].mobile_number) {
            this.respone[i].campaign_name = this.campdata[j].campaign_name;
            this.respone[i].template_name = this.campdata[j].template_name;
            break;
          }
        }
      }
      console.log(this.respone)
      this.filteredData = this.respone;
      this.isLoadingOne = false;
    });
  }

  generateExcelFile() {
    let data: any[] = [];
    let genarateObj: any = {};
    let i =1;
    if (this.filteredData) {
      this.filteredData.map((item: any) => {
        genarateObj.Id = i++;
        genarateObj.Mobile_number = item.mobile_number;
        genarateObj.Reply_text = item.reply_text;
        genarateObj.Timestamp = moment(item.timestamp).format("YYYY/MM/DD HH:mm:ss");
        data.push(genarateObj);
        genarateObj = {};
      });
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "response-1");

    XLSX.writeFile(wb, `response.xlsx`);
  }

  delete(data: any) {
    if (window.confirm("Do you want to delete?")) {
      let id = data.id;

      const reqObj = {
        is_deleted: 1,
        id: id,
       }
       this.reportService.delete(reqObj).subscribe((res: any) => {
        this.filteredData = this.filteredData.filter((item :any) => item.id !== id);

        console.log(res);
      })
    }
  }

  movetotrash() {
    const reqObj = {
      id: 1,
     }
    this.reportService.movetotrash(reqObj).subscribe((res: any) => {
      console.log(res);
      window.location.reload();
    })
  }

  filterDataDatewise() {
    console.log(this.reportForm.value.date_range);
    // console.log(moment(this.reportForm.value.date_range[0]).format("YYYY/MM/DD"))
    // console.log(moment(this.reportForm.value.date_range[1]).format("YYYY/MM/DD"))
    this.PageIndex = 1;
    this.filteredData = this.respone.filter((item: any) =>
      new Date(item.timestamp) >= new Date((moment(this.reportForm.value.date_range[0]).format("YYYY/MM/DD"))) &&
      new Date(item.timestamp) <= new Date((moment(this.reportForm.value.date_range[1]).format("YYYY/MM/DD")))
    );
    console.log(this.filteredData);
    this.generateTotalReport(this.filteredData);
  }

  generateTotalReport(data: any) {
    data.map((item: any) => {
      this.AllReport.Id = item.id,
        this.AllReport.Mobile_number = item.mobile_number,
        this.AllReport.Reply_text = item.reply_text,
        this.AllReport.timestamp = item.timestamp

    });
  }
}
