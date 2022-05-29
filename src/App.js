import React, { Component} from 'react';
import "./styles/reset.css";
import "./styles/app.css";
import github from "./imgs/github.svg"
import Instagram from "./imgs/Instagram.svg"
import Linkedin from "./imgs/Linkedin.svg"

class App extends Component {
    constructor() {
        super(); //poder pegar variaveis global
        this.state = {
            hora: "00:00:00"
            //defino a variavel
        }
    }

    componentDidMount(){
        setInterval(()=>{
            this.setState({hora: new Date().toLocaleTimeString()})
            //captura a hora atual e atualiza a variavel
        },1000); //1 segundo (intervalo)
    }

    render() {
        return(
            <div id="pagina">
                <div className="container-titulo">
                    <h1 id="titulo">Time</h1>
                </div>
                <div className="container-hora">
                    <h2 id="hora">{this.state.hora}</h2>
                </div>
                <div className="links">
                    <div className="container-links">
                        <div class="links-1">
                            <a href="https://github.com/fullzer4" className="card-links">
                                <img src={github} alt="github"/>
                            </a>
                        </div>
                        <div class="links-2">
                            <a href="https://www.instagram.com/yfullzer4.exe/" className="card-links">
                                <img src={Instagram} alt="instagram"/>
                            </a>
                        </div>
                        <div class="links-3">
                            <a href="https://www.linkedin.com/in/gabrielpereira-sc/" className="card-links">
                                <img src={Linkedin} alt="linkedin"/>
                            </a>
                        </div>
                    </div>
                    <div id="linha"></div>
                </div>
            </div>
        )
    }
}

export default App;