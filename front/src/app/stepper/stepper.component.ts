import { CalculoTempoServico } from './../models/calculo-tempo-servico';
import { PaginaresultadoComponent } from './../paginaresultado/paginaresultado.component';
import { StepperService } from './stepper.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
//import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Frequencia, Frequencias } from '../models/frequencia';
import { Averbado } from '../models/averbado';
import { Pessoa } from '../models/pessoa';

const DATA_FREQUENCIA: Frequencias = []; //Evitar siglas

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent implements OnInit {
  isEditable = true;
  displayedColumns: string[] = ['Ano', 'tempoLiquido', 'action'];
  dataSource = DATA_FREQUENCIA;
  pessoa?: Pessoa;
  averbado?: Averbado;
  sucessobject:any;


  firstFormGroup: FormGroup = this._formBuilder.group({
    genero: [, Validators.required],
    dataNascimento: [Date, Validators.required],
  });

  secondFormGroup: FormGroup = this._formBuilder.group({
    quantidadeDias: [, Validators.required],
    licencaPremioEmDias:[]
  });

  // thirdFormGroup: FormGroup= this._formBuilder.group({
  //   page3Ctrl:[,Validators.maxLength(1)]
  // });;

  @ViewChild(MatTable, { static: true }) table?: MatTable<any>;

  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private service: StepperService,
    public pagina:PaginaresultadoComponent,
    private router:Router
  ) {}
  ngOnInit(): void {

  }

  openDialog(action: any, obj: any) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '250px',
      data: obj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.event == 'Add') {
        this.addRowData(result.data);
      } else if (result.event == 'Update') {
        this.updateRowData(result.data);
      } else if (result.event == 'Delete') {
        this.deleteRowData(result.data);
      }
    });
  }

  addRowData(row_obj: Frequencia) {
    this.dataSource.push({
      idFrequencia: this.dataSource.length + 1,
      ano: row_obj.ano,
      tempoLiquido: row_obj.tempoLiquido,
      action: row_obj.action,
    });
    this.table?.renderRows();
  }

  updateRowData(row_obj: Frequencia) {
    this.dataSource.filter((value) => {
      if (value.idFrequencia == row_obj.idFrequencia) {
        value.ano = row_obj.ano;
        value.tempoLiquido = row_obj.tempoLiquido;
      }
      return true;
    });
  }

  deleteRowData(row_obj: Frequencia) {
    this.dataSource = this.dataSource.filter((value) => {
      return value.idFrequencia != row_obj.idFrequencia;
    });
  }

  novoEnviar() {
    this.pessoa = this.firstFormGroup.getRawValue() as Pessoa;
    this.averbado = this.secondFormGroup.getRawValue() as Averbado;

    const calculoTempoServico:CalculoTempoServico={
      pessoa:this.pessoa,
      frequencias:this.dataSource,
      averbacoes:this.averbado['quantidadeDias'],
      licencaPremioEmDias:this.averbado['licencaPremioEmDias']
    }

    // const dataNasc: DatePipe = new DatePipe('pt-BR');
    // let dataformatada = dataNasc.transform(
    //   this.pessoa.dataNascimento,
    //   'YYYY-MM-dd'
    // );
    this.service
      .Enviar(
        calculoTempoServico
      ).subscribe(
        //(sucess:any)=>console.log('sucess: ',sucess),
        (sucess:any) => {
          this.router.navigateByUrl('/paginaresultado',{state:{resultadoCalculo:sucess}})
        },
        (error) => console.log(error)
      );
  }
}
