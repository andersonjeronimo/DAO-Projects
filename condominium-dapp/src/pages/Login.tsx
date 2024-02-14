import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doLogin } from '../services/EthersService';

function Login() {

  const navigate = useNavigate();  
  const [message, setMessage] = useState<string>("");
  
  function btnLoginClick() {
    doLogin()
      .then(result => {
        setMessage(result.account);
        navigate("/topics");
      })
      .catch(err => {
        setMessage(err.code);
      });
  }

  return (
    <main className="main-content  mt-0">
      <div className="page-header align-items-start min-vh-100" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
        <span className="mask bg-gradient-dark opacity-6"></span>
        <div className="container my-auto">
          <div className="row">
            <div className="col-lg-4 col-md-8 col-12 mx-auto">
              <div className="card z-index-0 fadeIn3 fadeInBottom">
                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                  <div className="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                    <h4 className="text-white font-weight-bolder text-center mt-2 mb-0">Condominium DAO</h4>
                  </div>
                </div>
                <div className="card-body">
                  <form role="form" className="text-start">
                    <div className='text-center'>
                      <img src="/dao.webp" alt="DAO logo" width={192} />
                    </div>

                    <div className="text-center">
                      <button type="button" className="btn bg-gradient-primary w-100 my-4 mb-2" onClick={btnLoginClick}>
                        <img src="/assets/metamask.svg" alt="Metamask logo" width={48} className='me-2' />
                        Sign in with Metamask</button>
                    </div>
                    <p className="mt-4 text-sm text-center">
                      {message}
                    </p>
                    <p className="mt-4 text-sm text-center">
                      Don't have an account? Ask to the
                      <a href="mailto:anderson.luiz.sjc@gmail.com" className="text-primary text-gradient font-weight-bold ms-1">manager@email</a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="footer position-absolute bottom-2 py-2 w-100">
          <div className="container">
            <div className="row align-items-center justify-content-lg-between">
              <div className="col-12 col-md-6 my-auto">
                <div className="copyright text-center text-sm text-white text-lg-start">
                  © <script>
                    document.write(new Date().getFullYear())
                  </script>,
                  made with <i className="fa fa-heart" aria-hidden="true"></i> by
                  <a href="https://www.creative-tim.com" className="font-weight-bold text-white" target="_blank">Creative Tim</a>
                  htmlFor a better web.
                </div>
              </div>
              <div className="col-12 col-md-6">
                <ul className="nav nav-footer justify-content-center justify-content-lg-end">
                  <li className="nav-item">
                    <a href="https://www.creative-tim.com" className="nav-link text-white" target="_blank">Creative Tim</a>
                  </li>
                  <li className="nav-item">
                    <a href="https://www.creative-tim.com/presentation" className="nav-link text-white" target="_blank">About Us</a>
                  </li>
                  <li className="nav-item">
                    <a href="https://www.creative-tim.com/blog" className="nav-link text-white" target="_blank">Blog</a>
                  </li>
                  <li className="nav-item">
                    <a href="https://www.creative-tim.com/license" className="nav-link pe-0 text-white" target="_blank">License</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default Login;
