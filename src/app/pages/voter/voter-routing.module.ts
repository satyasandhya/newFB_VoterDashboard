import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 import { PollComponent } from './poll/poll.component';
 import { ReportComponent } from './report/report.component';
import { TrashReportComponent } from './trash-report/trash-report.component';
 import { PendingReportComponent } from './pending-report/pending-report.component';
const routes: Routes = [
  {path: "poll", component: PollComponent},
  {path : "report", component: ReportComponent},
  {path: "trash-report", component: TrashReportComponent},
  // {path : "pending-report", component : PendingReportComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VoterRoutingModule { }
