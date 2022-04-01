class Sign_in{
	constructor(props) {
		this.start()
	}

	async start(){
		this.handel_requstes()
	}	

	handel_requstes(){
		global.http_server.post('/sign_in/form',async(req,res)=>{
			var validation_cheek_state=this.check_sign_in_object_validate(req.body);
			if(!validation_cheek_state.valid){return}
			var check_object=await this.check_sign_in_data(req.body)
			if(check_object.state){
				this.set_log_in_cookie(res,req.body.email)
				res.json({state:true,redirect_url:''})
			}else{
				res.json({state:false,resone:check_object.resone})
			}
		})	
	}

	async check_sign_in_data(sign_in_object){
		var user=await manager_db.get_user_by_email(sign_in_object['email']);
		if(!user['result']){return {state:false,resone:'Ronge Email'}}
		var password_state=this.check_if_password_equl_hash(sign_in_object['password'],user['result']['password_hash'])
		if(!password_state){return {state:false,resone:'Ronge password'}}
		return {state:true}
	}

	check_if_password_equl_hash(password,hash){
		var virifiy_state=passwordHash.verify(password, hash)
		console.log(virifiy_state)
		return virifiy_state
	}

	check_sign_in_object_validate(sign_in_object){
		if(!sign_in_object){return{state:false,resone:'sometheng went rong'}}
		if(!sign_in_object['email']){return{state:false,resone:'sometheng went rong'}}
		if(!sign_in_object['password']){return{state:false,resone:'sometheng went rong'}}
		if(sign_in_object['email']==''){return {valid:false,resone:'Empty Email'}}
		if(sign_in_object['email']==' '){return {valid:false,resone:'Empty Email'}}
		if(!/\S+@\S+\.\S+/.test(sign_in_object['email'])){return {valid:false,resone:'Unvalid Email Address'}}
		if(sign_in_object['password']==''){return {valid:false,resone:'Empty password'}}
		if(sign_in_object['password']==' '){return {valid:false,resone:'Empty password'}}		
		if(sign_in_object['password'].length<=4){return {valid:false,resone:'Password Shoude Be More Than 4 Leters'}}		
		return {valid:true}	
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

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }

}

module.exports= new Sign_in
