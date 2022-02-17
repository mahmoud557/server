global.cookieParser = require('cookie-parser');
global.jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');
global.express = require('express')
global.cors = require('cors')
global.path = require('path')
global.bodyParser = require('body-parser');
global.fs=require('fs')
global.jsonfile = require('jsonfile')
global.nodemailer = require('nodemailer');
global.passwordHash = require('password-hash');
var {OAuth2Client} = require('google-auth-library');
global.OAuth2Client=OAuth2Client;
global.google_client = new global.OAuth2Client('530638225218-0bn200lkl8nqoionnv6ns2og60calf43.apps.googleusercontent.com'); 
global.transporter = global.nodemailer.createTransport({
	host: 'smtp.zoho.com',
	secure: true,
	port: 465,
	auth: {
	    user: '745387718',
	    pass: 'gzBHGMbbJC4J',
	},
	tls: {
	    rejectUnauthorized: false,
	}, 
});

class Manager_Main{
	
	constructor(props) {
		this.file_data_path=path.join(__dirname,'./app/home/data.json')
		this.start()
	}

	start_http_server(){
		global.http_server = global.express()
		global.http_server.use(global.cookieParser())
		global.http_server.use(global.cors())
		global.http_server.use(global.bodyParser.json())
		global.http_server.use(bodyParser.urlencoded({ extended: true }));
		global.http_server.use(global.express.static(global.path.join(__dirname,"app"),{index: false}));
		
		global.http_server.get('/',async(req,res)=>{
			var cookie_validate_state=this.check_requset_cookie_validat(req);
			if(!cookie_validate_state['state']){res.sendFile(path.join(__dirname, 'app/home/index.html')); return}
			var log_in_state=await this.check_user_log_in_state(req.cookies['outh_token'])
			if(!log_in_state){res.sendFile(path.join(__dirname, 'app/home/index.html')); return}
			res.redirect('/authed'); return
		})

		global.http_server.post('/get_url_info',async(req,res)=>{
			var url_info=await manager_get_stocks.get_url_info(req.body.url);
			res.json(url_info)
		})

		global.http_server.get('/authed',async(req,res)=>{
			var cookie_validate_state=this.check_requset_cookie_validat(req);
			if(!cookie_validate_state['state']){res.redirect('/'); return}
			var log_in_state=await this.check_user_log_in_state(req.cookies['outh_token'])
			if(!log_in_state){res.redirect('/'); return}
			res.sendFile(path.join(__dirname, 'app/home/index.html')); return
		})

		global.http_server.listen(3000)
	}

	async load_data_file(){
		var {photo_price_lines,video_price_lines,music_price_lines}=await jsonfile.readFile(this.file_data_path)
		this.photo_price=photo_price_lines;
		this.video_price=video_price_lines;
		this.music_price=music_price_lines;
	}

	check_requset_cookie_validat(req){
		if(!req.cookies){return {state:false}}
		if(!req.cookies['outh_token']){return {state:false}}
		return {state:true}
	}

	check_user_log_in_state(outh_token){
		try{
			var decode=jwt.verify(outh_token, 'shhhhh');
			return decode['log_in_state']
		}catch(err){
			return false
		}	
	}	

	load_managers(){
		global.manager_db = require('./manager_db.js');
		global.manager_users = require('./manager_users.js');
		global.manager_dashboard = require('./manager_dashboard.js');
		global.manager_get_stocks= require('./manager_get_stocks.js');
	}

	async start(){
		await this.load_data_file()
		this.start_http_server()
		this.load_managers()
	}

}
 global.MM=new Manager_Main
