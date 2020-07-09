import React, { Component } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Navigation from './components/navigation/Navigation.js';
import ImageLinkForm from './components/imageLinkForm/ImageLinkForm.js';
import FaceRecognition from './components/faceRecognition/FaceRecognition.js';
import Signin from './components/signin/Signin.js';
import Register from './components/register/Register.js';
import Rank from './components/rank/Rank.js';
import Logo from './components/logo/Logo.js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
  apiKey: '6d1552db98f74e80953269125fd8d888'
 });

const particlesOptions = {
  particles: {
    line_linked: {
      shadow: {
        enable: true,
        color: "#3CA9D1",
        blur: 5
      }
    }
  }
}

class App extends Component {

  constructor(){
    super();
    this.state={
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }


  calculateFaceLocation = (data) =>{
    console.info('calculateFaceLocation');
    const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.info(width,height);
    return{
      leftCol: face.left_col * width,
      topRow: face.top_row * height,
      rightCol: width -(face.right_col * width),
      bottomRow: height -(face.bottom_row * height)
    }
  }

  displaceFaceBox = (box) =>{
    this.setState({box: box});
  }

  onInputChange = (event) =>{
    this.setState({input: event.target.value});
  }

  onSubmit = () =>{
    this.setState({imageUrl: this.state.input})
    app.models.predict(Clarifai.FACE_DETECT_MODEL, [this.state.input])
    .then(response => this.displaceFaceBox(this.calculateFaceLocation(response)))
    .catch(err => console.log(err));
  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState({isSignedIn: false})
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render(){
    const {isSignedIn,box,imageUrl,route} = this.state;
    return (
      <div className="App">
        <Particles 
          className='particles'
          params={particlesOptions} 
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        {
          route === 'home' ? 
          <div>
            <Logo/>
            <Rank/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onSubmit}/>
            <FaceRecognition box={box} imageUrl={imageUrl}/>
          </div> :
          (route === 'signin'?<Signin onRouteChange={this.onRouteChange}/>:<Register onRouteChange={this.onRouteChange}/>)
          
        }
      </div>
    );
  }
  
}

export default App;
