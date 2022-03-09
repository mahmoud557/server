class Sign_Up{
	constructor(props) {
		this.verification_key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hN21vdWR4eXpAZ21haWwuY29tIiwicGFzc3dvcmQiOiJ2dnZ2dnYiLCJpYXQiOjE2NDI1Nzg3OTB9.2g0G3Is9o597RDPKN-Sv2kZqZTg9qs-0loxIDAwMhaw'
		this.verification_url='http://localhost:3000/sign_up/verification/'
		this.start()
	}

	async start(){
		this.handel_requstes()
		//console.log(true)
	}	

	handel_requstes(){
		global.http_server
		.post('/sign_up/form',async(req,res)=>{
			if(!req.body){return}
			var cheek_state=this.check_sign_up_object_validate(req.body);
			if(!cheek_state.valid){return}
			var used_before_cheek_state=await this.cheek_if_email_used_befor(req.body.email);
			if(used_before_cheek_state.result==true){res.json({state:false,resone:'Email Used Before'}); return}
			if(used_before_cheek_state.err==true){res.json({state:false,resone:'Something Went Rong Please Try Agan'}); return}
			var verification_url=this.create_verification_url(req.body['email'],req.body['password'])
			var send_state=await this.send_verification_url_to_email(req.body['email'],verification_url)
			res.json({state:true}); 
		})

		global.http_server
		.get('/sign_up/verification/:token',async(req,res)=>{
			var sign_up_object=this.parse_verification_token(req.params.token)
			if(!sign_up_object){return}
			if(!sign_up_object['email']){return}
			if(!sign_up_object['password']){return}
			var verified_befor_state=await  this.cheek_if_email_used_befor(sign_up_object['email'])
			if(verified_befor_state.result==true){res.json({state:false,resone:'Email Is verified'}); return}
			if(verified_befor_state.err==true){res.json({state:false,resone:'Something Went Rong Please Try Agan'}); return}			
			var add_user_state=await this.add_new_user(sign_up_object)
			if(add_user_state){res.redirect('/')}
		})
	}



	check_sign_up_object_validate(sign_up_object){
		if(!sign_up_object){return {valid:false,resone:'Empty Data'}}
		if(!sign_up_object['email']){return {valid:false,resone:'Empty Email'}}
		if(!sign_up_object['password']){return {valid:false,resone:'Empty password'}}
		if(!sign_up_object['re_password']){return {valid:false,resone:'Empty re_password'}}
		if(sign_up_object['email']==''){return {valid:false,resone:'Empty Email'}}
		if(sign_up_object['email']==' '){return {valid:false,resone:'Empty Email'}}
		if(!/\S+@\S+\.\S+/.test(sign_up_object['email'])){return {valid:false,resone:'Unvalid Email Address'}}
		if(sign_up_object['password']==''){return {valid:false,resone:'Empty password'}}
		if(sign_up_object['password']==' '){return {valid:false,resone:'Empty password'}}		
		if(sign_up_object['password'].length<=4){return {valid:false,resone:'Password Shoude Be More Than 4 Leters'}}		
		if(sign_up_object['password']!=sign_up_object['re_password']){return {valid:false,resone:'Passwords did nnot match'}}
		return {valid:true}
	}

	async cheek_if_email_used_befor(email){
		var quiry=await manager_db.get_user_by_email(email);
		if(quiry.err){return {err:true}}
		if(quiry.result==null){return {err:false,result:false}}
		if(quiry.result){return {err:false,result:true}}
	}



	create_verification_url(email,password){
		var token = jwt.sign({ email: email ,password:password }, this.verification_key);
		var verification_url=this.verification_url+token
		return verification_url
	}

	async send_verification_url_to_email(email,verification_url){
		const mailOptions = {
		 from: "Graficy <man389@zohomail.com>", // sender address
		 to: email,
		 subject: "Graficy verification Code", // Subject line
		 html: `
			 	<h1>Welcome To Graficy</h1>
			 	<h2>that is your verification Link</h2>
			 	<a href=${verification_url}>${verification_url}</a>
		 `
		};	
		var send_state=await transporter.sendMail(mailOptions);
		console.log(send_state)
	}

	async add_new_user(sign_up_object){
		console.log(sign_up_object)
		var password_hash=passwordHash.generate(sign_up_object['password']);
		var user_opject={
			email:sign_up_object['email'],
			password_hash:password_hash,
			username:sign_up_object['email'],
			picture:null,
			palance:0,
			order_list:[],
			download_list:[]			
		};
		var add_state=await manager_db.add_new_user(user_opject)
		if(add_state.result){return true}else{return false}
	}

	parse_verification_token(token){
		try{
			var sign_up_object=jwt.verify(token, this.verification_key);
			return sign_up_object;		
		}catch(err){return false}
	}

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }

}

//gzBHGMbbJC4J

module.exports= new Sign_Up
