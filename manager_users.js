class Manager_users{
	constructor(props) {
		this.reseat_password_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hN21vdWR4eXpAZ21haWwuY29tIiwicGFzc3dvcmQiOiJ2dnZ2dnYiLCJpYXQiOjE2NDI1Nzg3OTB9.2g0G3Is9o597RDPKN-Sv2kZqZTg9qs-0loxIDAwMhaw'
		this.reseat_password_url='http://localhost:3000/manager_users/reseat_password/verification/'
		this.start()
	}

	async start(){
		this.handel_requstes()
		this.load_componants()
	}	


	load_componants(){
		this.sign_in = require('./componants/sign_in.js');
		this.sign_up = require('./componants/sign_up.js');
	}

	handel_requstes(){
		global.http_server
		.post('/manager_users/contanuio_with_google',async(req,res)=>{
			var  google_outh_object=await this.get_google_outh_object_from_req(req)
			if(!google_outh_object){res.end();return}
			var reqord_if_not_reqorded_state=await this.reqord_user_if_not_reqorded(google_outh_object)
			if(reqord_if_not_reqorded_state.err){res.redirect('/');return}
			this.set_log_in_cookie(res,google_outh_object['email'])
			res.redirect('/')
		})

		global.http_server
		.post('/manager_users/log_out',async(req,res)=>{
			var cookie_validate_state=this.check_requset_cookie_validat(req)
			if(!cookie_validate_state){res.end(); return;}
			var user_log_in_state=this.check_user_log_in_state(req.cookies['outh_token'])
			if(!user_log_in_state){res.end(); return;}
			this.set_log_out_cookie(res)
			res.json({logout_state:true})
		})	

		global.http_server
		.post('/manager_users/forget_password',async(req,res)=>{
			if(!req.body){return}
			var cheek_state=this.check_forget_password_object_validate(req.body);
			if(!cheek_state.valid){return res.end()}
			var cheek_if_email_exest_state=await this.cheek_if_email_exest(req.body.email);
			if(cheek_if_email_exest_state.err){return res.json({state:false,resone:'Server Error'})}			
			if(cheek_if_email_exest_state.result==false){return res.json({state:false,resone:'Ronge Email'})}		
			var ip=req.headers['x-forwarded-for'] || req.socket.remoteAddress;
			var reseat_password_url=this.create_reseat_password_url(req.body['email'],ip)
			var send_state=await this.send_reseat_password_url_to_email(req.body['email'],reseat_password_url)
			res.json({state:true});
		})

		global.http_server
		.get('/manager_users/reseat_password/verification/:token/:email',async(req,res)=>{
			res.sendFile(path.join(__dirname, 'app/home/index.html')); 
		})

		global.http_server
		.post('/manager_users/reseat_password',async(req,res)=>{
			if(!req.body){return}
			var cheek_state=this.check_reseat_password_object_validate(req.body);
			if(!cheek_state.valid){return res.end()}
			var token_cheek_state=this.cheek_reseat_password_token_validate(req)
			if(!token_cheek_state){return res.json({state:false,resone:'unvalid token'})}
			var reseat_password_state=await this.reseat_password(req)
			if(!reseat_password_state){return res.json({state:false,resone:'server error'})}
			res.json({state:true});
		})						
	}

	check_forget_password_object_validate(forget_password_object){
		if(!forget_password_object){return {valid:false,resone:'Empty Data'}}
		if(!forget_password_object['email']){return {valid:false,resone:'Empty Email'}}
		if(forget_password_object['email']==''){return {valid:false,resone:'Empty Email'}}
		if(forget_password_object['email']==' '){return {valid:false,resone:'Empty Email'}}
		if(forget_password_object['email'].length>320){return {valid:false,resone:'To Large Email'}}
		if(!/\S+@\S+\.\S+/.test(forget_password_object['email'])){return {valid:false,resone:'Unvalid Email Address'}}		
		return {valid:true}
	}

	check_reseat_password_object_validate(forget_password_object){
		if(!forget_password_object){return {valid:false,resone:'Empty Data'}}
		if(!forget_password_object['password']){return {valid:false,resone:'Empty password'}}
		if(!forget_password_object['re_password']){return {valid:false,resone:'Empty re_password'}}			
		if(!forget_password_object['email']){return {valid:false,resone:'Empty Email'}}
		if(!forget_password_object['token']){return {valid:false,resone:'Empty token'}}
		if(forget_password_object['email']==''){return {valid:false,resone:'Empty Email'}}
		if(forget_password_object['email']==' '){return {valid:false,resone:'Empty Email'}}
		if(forget_password_object['email'].length>320){return {valid:false,resone:'To Large Email'}}
		if(!/\S+@\S+\.\S+/.test(forget_password_object['email'])){return {valid:false,resone:'Unvalid Email Address'}}		
		if(forget_password_object['password']==''){return {valid:false,resone:'Empty password'}}
		if(forget_password_object['password']==' '){return {valid:false,resone:'Empty password'}}		
		if(forget_password_object['password'].length<=4){return {valid:false,resone:'Password Shoude Be More Than 4 Leters'}}	
		if(forget_password_object['password'].length>40){return {valid:false,resone:'Password Shoude Be less Than 40 Leters'}}	
		if(forget_password_object['password']!=forget_password_object['re_password']){return {valid:false,resone:'Passwords did nnot match'}}		
		if(forget_password_object['token']==''){return {valid:false,resone:'Empty token'}}
		if(forget_password_object['token']==' '){return {valid:false,resone:'Empty token'}}		
		if(forget_password_object['token'].length<=4){return {valid:false,resone:'token Shoude Be More Than 4 Leters'}}	
		//if(forget_password_object['token'].length>100){return {valid:false,resone:'Password Shoude Be less Than 40 Leters'}}			
		return {valid:true}
	}

	async reseat_password(req){
		var email=req['body']['email'];
		var password=req['body']['password'];
		var password_hash=passwordHash.generate(password);
		var update_qurey=await manager_db.update_user_password_by_email(email,password_hash)
		if(update_qurey.result==false){return false}
		if(update_qurey.err==true){return false}
		return true
	}


	cheek_reseat_password_token_validate(req){
		var ip=req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		var token_paylod=this.parse_reseat_password_token(req['body']['token']);
		if(!token_paylod['email']){return false}
		if(!token_paylod['ip']){return false}
		if(token_paylod['email']!=req['body']['email']){return false}
		if(token_paylod['ip']!=ip){return false}
		return true;
	}

	async cheek_if_email_exest(email){
		var quiry=await manager_db.get_user_by_email(email);
		if(quiry.err){return {err:true}}
		if(quiry.result==null){return {err:false,result:false}}
		if(quiry.result){return {err:false,result:true}}
	}

	create_reseat_password_url(email,ip){
		var token = jwt.sign({ email: email, ip:ip }, this.reseat_password_key, { expiresIn: 4 * 60 });
		var reseat_password_url=`${this.reseat_password_url}${token}/${email}#reseat_password`
		return reseat_password_url
	}

	async send_reseat_password_url_to_email(email,reseat_password_url){
		const mailOptions = {
		 from: "Graficy <man389@zohomail.com>", // sender address
		 to: email,
		 subject: "Graficy Reseat Password Url", // Subject line
		 html: `
			 	<h1>Welcome To Graficy</h1>
			 	<h2>that is your Reseat Password Link</h2>
			 	<a href=${reseat_password_url}>${reseat_password_url}</a>
		 `
		};	
		var send_state=await transporter.sendMail(mailOptions);
		console.log(send_state)
	}	

	async get_google_outh_object_from_req(req){
		try{
			if(!req.body){return false}
			if(!req.body.credential){return false}
			const ticket = await google_client.verifyIdToken({
			    idToken: req.body.credential,
			    audience: '530638225218-0bn200lkl8nqoionnv6ns2og60calf43.apps.googleusercontent.com',
			});
			if(!ticket){return false}
			if(!ticket.payload){return false}
			var google_outh_object=ticket.payload;
			return google_outh_object			
		}catch(err){
			res(false)
		}
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

	parse_reseat_password_token(token){
		try{
			var decode=jwt.verify(token, this.reseat_password_key);
			return decode
		}catch(err){
			return false
		}	
	}

	async reqord_user_if_not_reqorded(google_outh_object){
		try{
			var user_qurey=await manager_db.get_user_by_email(google_outh_object['email']);
			if(user_qurey.err){return {err:true}}
			if(!user_qurey.result){
				var user_opject={
					email:google_outh_object['email'],
					username:google_outh_object['given_name'],
					picture:google_outh_object['picture'],
					palance:0,
					order_list:[],
					download_list:[]
				};
				var add_state=await manager_db.add_new_user(user_opject)
				if(add_state.result){return true}else{return {err:true}}
			}else{return true}			
		}catch(err){return {err:true}}
	}

	set_log_in_cookie(res,email){
	    var options = {
	        maxAge: 10000 * 60 * 15, // would expire after 15 minutes
	        httpOnly: true // The cookie only accessible by the web server
	    }
	    var outh_object={
	    	log_in_state: true,
	    	email:email
	    }
	    var token = jwt.sign(outh_object, 'shhhhh');
	    res.cookie('outh_token', token, options) 
	}

	set_log_out_cookie(res){
	    var options = {
	        maxAge: 10000 * 60 * 15, // would expire after 15 minutes
	        httpOnly: true // The cookie only accessible by the web server
	    }
	    var outh_object={
	    	log_in_state: false,
	    }
	    var token = jwt.sign(outh_object, 'shhhhh');
	    res.cookie('outh_token', token, options) 
	}			

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }


}

module.exports= new Manager_users
