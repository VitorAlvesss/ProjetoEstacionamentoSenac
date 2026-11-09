import 'dart:typed_data';
import 'package:flutter/material.dart';

class telaCadastro extends StatefulWidget{
  const telaCadastro({super.key});

  @override
  State<telaCadastro> createState() => _tela_cadastro();
}

class _tela_cadastro extends State<telaCadastro> {
  String placa = "";
  final _placaController = TextEditingController();

  String marca = "";
  final _marcaController = TextEditingController();

  String modelo = "";
  final _modeloController = TextEditingController();

  String cor = "";
  final _corController = TextEditingController();

  int ano = 0;
  final _anoController = TextEditingController();

  @override
  Widget build(BuildContext context){
    const proporcaoImagem = 2216 / 709;
    final largura = MediaQuery.of(context).size.width;
    final alturaHeader = (largura / proporcaoImagem).clamp(110.0, 220.0);
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: alturaHeader,
        
        title: const Padding(
          padding: EdgeInsets.only(bottom: 35),
          child: Text(
            "Cadastro de veículo.",
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        
        // backgroundColor: const Color.fromARGB(255, 211, 106, 19),
        foregroundColor: Colors.white,

        flexibleSpace: Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage("assets/imagens/header_carro.png"),
              fit: BoxFit.cover,
              alignment: Alignment.bottomCenter,
            ),
          ),
        ),
        
      ),


      body: Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            children: [
              SizedBox(height: 50),

              Text(
                "Placa",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold
                ),
              ),

              SizedBox(height: 20),

              TextField(
                controller: _placaController,
                decoration: InputDecoration(
                  hintText: "Insira a placa do veículo.",
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(
                    Icons.directions_car,
                    color: Colors.deepOrange,
                  ),
                  
                ),
              ),

              SizedBox(height: 15),

              Text(
                "Marca",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold
                ),
              ),

              SizedBox(height: 20),

              TextField(
                controller: _marcaController,
                decoration: InputDecoration(
                  hintText: "Marca do veículo.",
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(
                    Icons.label,
                    color: Colors.deepOrange,
                  ),
                ),
              ),

              SizedBox(height: 15),

              Text(
                "Modelo",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold
                ),
              ),

              SizedBox(height: 20),

              TextField(
                controller: _modeloController,
                decoration: InputDecoration(
                  hintText: "Modelo do veículo.",
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(
                    Icons.directions_car,
                    color: Colors.deepOrange,
                  ),
                ),
              ),

              SizedBox(height: 15),

              Text(
                "Cor",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold
                ),
              ),

              SizedBox(height: 20),

              TextField(
                controller: _corController,
                decoration: InputDecoration(
                  hintText: "Cor do veículo.",
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(
                    Icons.palette,
                    color: Colors.deepOrange,
                  ),
                ),
              ),

              SizedBox(height: 15),

              SizedBox(height: 15),

              Text(
                "Ano",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold
                ),
              ),

              SizedBox(height: 20),

              TextField(
                controller: _anoController,
                decoration: InputDecoration(
                  hintText: "Ano do veículo.",
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(
                    Icons.calendar_today,
                    color: Colors.deepOrange,
                  ),
                ),
              ),

              SizedBox(height: 20),

              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: "Selecione o tipo do veículo",
                  border: OutlineInputBorder(),
                   prefixIcon: Icon(
                    Icons.category,
                    color: Colors.deepOrange,
                  ),
                ),
                items: const [
                  DropdownMenuItem(value: "carro", child: Text("Carro")),
                  DropdownMenuItem(value: "moto", child: Text("Moto")),
                ],
                onChanged: (valor) {
                  setState(() {
                  });
                },
              ),



              SizedBox(height: 20),

              ElevatedButton.icon(
                icon: const Icon(Icons.save),
                onPressed: () async {
                  placa = _placaController.text;
                  marca = _marcaController.text;
                  modelo = _modeloController.text;       
                  cor = _corController.text;
                           

                  if(marca.isEmpty || modelo.isEmpty || placa.isEmpty || cor.isEmpty || _anoController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Todos os campos devem estar preenchidos."),
                        backgroundColor: Colors.red,
                      )
                    );
                    return;
                  }
                  else{
                    try{
                      

                    } 
                    catch(erro){
                      ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Erro ao cadastrar veículo."),
                        backgroundColor: Colors.red,
                      ),
                    );
                    }               
                  }
                },
                label: const Text('Cadastrar'),
              )


            ],
          ),
        )
      )
    );
  }
}