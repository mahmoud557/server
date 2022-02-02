class Manager_Dashboard{
	constructor(props) {
		this.start()
	}

	async start(){
		this.load_componants()
		this.handel_requstes()
	}

	handel_requstes(){
		global.http_server.get('/dashboard',async(req,res)=>{
			var cookie_validate_state=this.check_requset_cookie_validat(req);
			if(!cookie_validate_state['state']){res.redirect('/'); return}
			var log_in_state=await this.check_user_log_in_state(req.cookies['outh_token'])
			if(!log_in_state){res.redirect('/'); return}
			res.sendFile(path.join(__dirname, 'app/dashboard/index.html'))
		})	
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

	load_componants(){
		this.account = require('./componants/account.js');
	}

    delay(time){
        return new Promise((res,rej)=>{
            setTimeout(()=>{res()},time)
        })
    }


}

module.exports= new Manager_Dashboard
