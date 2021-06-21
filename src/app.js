import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dayjs from 'dayjs'

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;

const connection = new Pool({
  user: 'bootcamp_role',
  password: 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp',
  host: 'localhost',
  port: 5432,
  database: 'boardcamp'
});

let localizador = 0;
let categorias = [];
let jogos = [];
let clientes = [];
let alugueis = [];
let existeCategoria = false;
let existeIdCategoria = false;
let existeNomeJogo = false;
let dataValida = true;
let existeCPF = false;
loadCategorias();

async function loadCategorias(){
    const result = await connection.query('SELECT * FROM categories');
    if(result.row != []){
        categorias = [...result.rows];
        console.log(categorias);
    }
    return result.rows;
}

function verificarCategoria(categoria){
    if(categorias.length != 0){
        for(let i =0; i<categorias.length; i++){
            if(categoria === categorias[i]){
                existeCategoria = true;
            }
        }
    }
    else{
        existeCategoria = false;
    }
}

function verificarIdCategoria(id){
    if(categorias.length != 0){
        for(let i =0; i<categorias.length; i++){
            if(id === categorias[i].id){
                existeIdCategoria = true;
            }
        }
    }
    else{
        existeIdCategoria = false;
    }
}

function verificarNomeJogo (nome){
    if(jogos.length != 0){
        for(let i =0; i<jogos.length; i++){
            if(nome === jogos[i].name){
                existeNomeJogo = true;
                localizador = i;
            }
        }
    }
    else{
        existeNomeJogo = false;
    }
}


function verificarCPF(cpf){
    if(clientes.length != 0){
        for(let i = 0; i < clientes.length; i++){
            if(cpf == clientes[i].cpf){
                existeCPF = true;
            }
        }
    }
    else{
        existeCPF = false;
    }
}

function validarData(data){
    if(data[5] != 1 && data[6] != 0){
      dataValida = false;
    }
    if(data[8] != 1 && data[8]!= 0 && data[8]!= 2 && data[8]!= 3){
      dataValida = false;
    }
    if(data[8]== 3){
        if(data[9] != 0 && data[9] != 1){
            dataValida = false;
        }
    }
    else{
        dataValida = true;
    }
}


app.get('/categories', (req, res) => {
        const result = loadCategorias();
        res.send(result);
      });

app.post('/categories', async (req, res) =>{
    const {name} = req.body;
    verificarCategoria(name);
    if(name == '' || existeCategoria == true){
        if(existeCategoria){
            res.status(409).end();
        }
        else{
            res.status(400).end();
        }
        
    }
    else{
        try{
            const result = await connection.query('INSERT INTO categories (name) VALUES ($1)', [name]);
            res.status(200).end();

        }catch(error){
            res.status(500).end();
        }
    }
    
});


app.get('/games', async (req, res) => {
    const result = await connection.query('SELECT * FROM games');
    if(result.row != []){
        jogos = [...result.rows];
        console.log(jogos);
    }
    res.send(result.rows);
  });

app.post('/games', async (req, res) => {  
    verificarIdCategoria(req.body.categoryId);
    verificarNomeJogo(req.body.name);
        if(req.body.name == '' || req.body.stockTotal < 0 || req.body.pricePerDay < 0){
            console.log("N TEM CFUNDA");
            res.status(400).end();
            
        }
        else if(existeIdCategoria === false){
            console.log("N TEM CATEGORIA");
            res.status(400).end();
        }
        else if(existeNomeJogo === true){
            res.status(409).end();
        }
        else{
            try{
                const result = await connection.query('INSERT INTO games (name , image , "stockTotal" , "categoryId", "pricePerDay") VALUES ($1 , $2 , $3 , $4 , $5)', [req.body.name, req.body.image, req.body.stockTotal, req.body.categoryId, req.body.pricePerDay]);
                res.status(200).end();
    
            }catch(error){
                console.log(error);
                res.status(500).end();
            }
        }
});

app.get('/customers', async (req, res) => {
    const result = await connection.query('SELECT * FROM customers');
    if(result.row != []){
        clientes = [...result.rows];
        console.log(clientes);
    }
    res.send(result.rows);
  });

  app.post('/customers', async (req, res) => { 
      validarData(req.body.birthday);
      verificarCPF(req.body.cpf);
      if(req.body.cpf.length != 11 || req.body.name == '') {
        res.status(400).end();
      }
        if(req.body.phone.length != 10 && req.body.phone.length != 11){
        res.status(400).end();
      }
      else if(dataValida == false){
        res.status(400).end();
      }
      else if(existeCPF == true){
        res.status(409).end();
      }
      else{
        try{
            const result = await connection.query('INSERT INTO customers (name, phone, cpf, "birthday") VALUES ($1 , $2 , $3 , $4 )', [req.body.name, req.body.phone, req.body.cpf, req.body.birthday]);
            res.status(200).end();
        }catch(error){
            console.log(error);
            res.status(500).end();
        }
      }
    
  });

  app.put('/customers/:id', async (req, res)=>{
    validarData(req.body.birthday);
    if(req.body.cpf.length != 11 || req.body.name == '') {
      res.status(400).end();
    }
      if(req.body.phone.length != 10 && req.body.phone.length != 11){
      res.status(400).end();
    }
    else if(dataValida == false){
      res.status(400).end();
    }
    else{
      try{
          const result = await connection.query('UPDATE customers SET name=$1, phone = $2, cpf=$3, "birthday"=$4  WHERE id= $5', [req.body.name, req.body.phone, req.body.cpf, req.body.birthday, req.params.id]);
          res.status(200).end();
      }catch(error){
          console.log(error);
          res.status(500).end();
      }
    }
  });
app.get('/rentals', async (req, res) => {
    const result = await connection.query('SELECT * FROM rentals');
    if(result.row != []){
        alugueis = [...result.rows];
        console.log(alugueis);
    }
    res.send(result.rows);
  });

  app.post('/rentals', async (req, res) => { 
    let now = dayjs();
    const rentDate = now.format('YYYY-MM-DD');
    console.log(rentDate);
    const originalPrice = 0;
    try{
        const result = await connection.query('INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1 , $2 , $3 , $4 , $5, $6, $7)', [req.body.customerId, req.body.gameId, rentDate, req.body.daysRented, null, originalPrice, null]);
        res.status(200).end();
    }catch(error){
        console.log(error);
        res.status(500).end();
    }

  });

app.listen(4000, () => {
    console.log('Server listening on port 4000.');
  });
