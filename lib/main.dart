import 'package:telacadastrocarros/paginas/telaCadastro.dart';
import 'package:flutter/material.dart';
import 'package:flutter/material.dart';



void main() {
  runApp(const MyApp());
}



class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Projeto UC12',
      //Remove a faixa debug
      debugShowCheckedModeBanner: false,
      //dfefine o tema do aplicativo
      theme: ThemeData(
        //cor principal do app
        primarySwatch: Colors.indigo,
        //ativa o padrão visual mais recente do Material Design
        useMaterial3: true,
      ),
      //define qual seria a primeira tela a ser exibida.
      home: telaCadastro(),
    );
  }
}
