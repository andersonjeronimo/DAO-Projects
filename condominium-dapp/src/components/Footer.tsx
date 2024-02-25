function Footer() {
    return (
        <footer className="footer py-4  ">
            <div className="container-fluid">
                <div className="row align-items-center justify-content-lg-between">
                    <div className="col-lg-6 mb-lg-0 mb-4">
                        <div className="nav nav-footer justify-content-center justify-content-lg-start">
                            <i className="fa fa-solid fa-terminal fa-2x me-2 ms-2"></i>by: Anderson Luiz
                        </div>
                        <div className="nav nav-footer justify-content-center justify-content-lg-start">
                            <i className="fa fa-github fa-2x ms-2"></i>
                            <a href="https://github.com/andersonjeronimo/DAO-Projects" className="nav-link text-muted" target="_blank">Project on GitHub</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
export default Footer;