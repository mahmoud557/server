class Account{
	constructor(props) {
		this.start()
	}

	async start(){
		console.log(true)
		this.handel_requstes()
	}	

	handel_requstes(){
		global.http_server.post('/account/personal_information/edit_username',async(req,res)=>{
			var log_in_state=await this.cheek_if_log_in_ruteen(req);
			if(!log_in_state){res.end();return}
			this.edit_username(req,res)
		})	
	}

	
	async edit_username(req,res){
		var user_name=req.body.user_name;
		var outh_object=this.get_auth_object_from_req(req)
		if(!user_name){res.end();return}
		if(user_name==''){res.end();return}
		if(user_name==' '){res.end();return}
		var qurey_result_object=await manager_db.update_user_username_by_email(outh_object.email,user_name); 
		if(qurey_result_object.result){res.json({error:false,})}
	}

	async cheek_if_log_in_ruteen(req){
		var cookie_validate_state=this.check_requset_cookie_validat(req);
		if(!cookie_validate_state['state']){return false}
		var log_in_state=await this.check_user_log_in_state(req.cookies['outh_token'])
		if(!log_in_state){return false}	
		return true	
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

	get_auth_object_from_req(req){
		try{
			var outh_token=req.cookies['outh_token'];
			var decode=jwt.verify(outh_token, 'shhhhh');
			return decode
		}catch(err){
			return false
		}	
	}

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }

}

module.exports= new Account
