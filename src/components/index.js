import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Route, BrowserRouter, Link, Redirect, Switch } from 'react-router-dom'
import Login from './auth/Login'
import Register from './auth/Register'
import PostForm from './post/PostForm'
import Profile from './profile/Profile'
import EditUserProfile from './profile/ProfileInfosForm'
import PostSection from './post/PostSection'
import PostDetails from './post/PostDetails'
import AttendForm from './post/AttendForm'
import AttendeesList from './post/AttendeesList'

import { Post } from '../controllers/Post'
import { Auth } from '../controllers/Auth'
import { firebaseAuth } from '../config/constants'
import { Spinner } from 'react-mdl'
import UserPublicProfile from "./profile/UserPublicProfile";

const PrivateRoute  = ({component: Component, authed, ...rest}) => {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} authed={authed}/>
        : <Redirect to={{pathname: '/login', props:props ,state: {from: props.location}}} />}
    />
  )
}

function PublicRoute ({component: Component, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => <Component {...props}/> }
    />
  )
}

export default class App extends Component {
  constructor(props) {
    super(props)
	  this.state = {
		  authed: false,
		  loading: true,
      posts:{},
	  }
	  this.postController = new Post()
  }
  
  async componentDidMount () {
	  const posts = await this.postController.getAllPosts()
	  this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authed: true,
          loading: false,
          posts
        })
      } else {
        this.setState({
          authed: false,
          loading: false,
          posts
        })
      }
    })
  }
  componentWillUnmount () {
    this.removeListener()
  }
  render() {
    const auth = new Auth()
    const logout = auth.logout
    const { authed } = this.state

    return this.state.loading === true
      ? <Spinner />
      : (
      <BrowserRouter >
        <div>
          <nav className="navbar navbar-default navbar-static-top">
            <div className="container">
              <div className="navbar-header">
                <Link to="/" className="navbar-brand">Job Seeker</Link>
              </div>
              <ul className="nav navbar-nav pull-right">
                {authed
                  ? <li>
                    <Link to="/addPost" className="navbar-brand">Add Post</Link>
                  </li>
                  :null
                }
                <li>
                  <Link to="/" className="navbar-brand">Posts</Link>
                </li>
                {authed
                  ? <li>
                    <Link to="/profile" className="navbar-brand">Profile</Link>
                  </li>
                  :null
                }
                <li>
                  {authed
                    ? <button
                        style={{border: 'none', background: 'transparent'}}
                        onClick={() => logout() }
                        className="navbar-brand">Logout</button>
                    : <span>
                        <Link to="/login" className="navbar-brand">Login</Link>
                        <Link to="/register" className="navbar-brand">Register</Link>
                      </span>}
                </li>
              </ul>
            </div>
          </nav>
          <div className="container">
            <div className="row">
              <Switch>
                <Route path='/' exact
                       render={(props) => <PostSection {...props} posts={this.state.posts} />}/>
                <PublicRoute path='/login' component={Login} />
                <PublicRoute path='/register' component={Register} />
                <PublicRoute authed={authed} {...this.props} path='/post/details/:id' component={PostDetails} />
                <PublicRoute authed={authed} {...this.props} path='/user/profile/:id' component={UserPublicProfile} />
                <PrivateRoute authed={authed} {...this.props} path='/profile' component={Profile} />
                <PrivateRoute authed={authed} {...this.props} path='/addPost' component={PostForm} />
                <PrivateRoute authed={authed} {...this.props} path='/editProfile' component={EditUserProfile} />
                <PrivateRoute authed={authed} {...this.props} path='/editPost' component={PostForm} />
                <PrivateRoute authed={authed} {...this.props} path='/provider/hire/:id' component={AttendForm} />
                <PrivateRoute authed={authed} {...this.props} path='/posts/attendeesList/:id' component={AttendeesList} />
                <PrivateRoute authed={authed} {...this.props} path='/job/apply/:id' component={AttendForm} />
                <Route render={() => <h3>No Match</h3>} />
              </Switch>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}
