import React from 'react'
import logoBlack from './../img/logo-black.png'
import logoWhite from './../img/logo-white.png'
import { FaFacebookF, FaTwitter, FaTelegram, FaDiscord } from 'react-icons/fa';

const Footer = () => {
    const urlGoga = process.env.REACT_APP_GOGA_URl
  return (
      <footer className="footer-section bg-dark on-dark">
          <div className="container py-5">
              <div className="mb-4">
                  <a className="navbar-brand" href="index.html">
                      <img className="logo-dark logo-img" src={logoBlack} alt="logo" />
                      <img className="logo-light logo-img" src={logoWhite} alt="logo" />
                  </a>
              </div>
              <div className="row">
                  <div className="col-lg-6 mb-3">
                      <div className="small-text-center">
                          <p>Global Head Office: 3 Fraser Street, #05-25 Duo Tower, Singapore (189352)</p>
                          <p>Vietnam: The 1st Floor, B Tower - The Light Building, To Huu, Ha Noi</p>
                          <p>Thailand: 42 Patthana Chonabot 3 Rd, Khet Lat Krabang, Bangkok</p>
                          <p>Indonesia:Jl. Ciledug Raya No.24D, RT.1/RW.3, Kota Jakarta Selatan</p>
                          <p>Customer Support: <a title="mailto:support@x3english.com"
                                                  href="mailto:support@goga.ai">support@goga.ai</a></p>
                          <p>Business Enquiries:  <a title="mailto:token@goga.ai"
                                                  href="mailto:token@goga.ai">token@goga.ai</a></p>
                          <p>Hotline:&nbsp;1900.633.321</p>
                      </div>
                  </div>
                  <div className="col-6 col-lg-2 mb-3">
                      <ul className="list-unstyled">
                          <li className="mb-3"><a href="https://whitepaper.goga.ai/introduction/about-goga" className="nav-link">About Us</a></li>
                          <li className="mb-3"><a href="https://whitepaper.goga.ai/products-and-features/goga-solution" className="nav-link">GOGA solution</a></li>
                          <li className="mb-3"><a href="https://whitepaper.goga.ai/products-and-features/learn-to-earn" className="nav-link">LEARN TO EARN </a></li>
                          <li className="mb-3"><a href={urlGoga+"/faqs"} className="nav-link">FAQs</a></li>
                      </ul>
                  </div>
                  <div className="col-6 col-lg-2 mb-3">
                      <ul className="list-unstyled">
                          <li className="mb-3"><a href="https://whitepaper.goga.ai/" className="nav-link">Whitepaper </a></li>
                          {/* <li className="mb-3"><a href={urlGoga} className="nav-link">Docs</a></li> */}
                          <li className="mb-3"><a href="https://whitepaper.goga.ai/tokenomics/token-allocation" className="nav-link">TOKENOMICS</a></li>
                          <li className="mb-3"><a href={urlGoga+"/terms-of-use/"} className="nav-link">Terms of use</a></li>
                          <li className="mb-3"><a href={urlGoga+"/privacy-policy/"} className="nav-link">Privacy Policy</a></li>
                      </ul>
                  </div>
                  <div className="col-12 col-lg-2 mb-3">
                      <div className="row">
                          <div className="col-6 col-lg-12 mb-4">
                              <h4 className="uppercase medium-text-center">Join our community</h4>

                              <div className="social-icons follow-icons medium-text-center">
                                  <a href="https://www.facebook.com/gogaAI.VN/" target="_blank"
                                      rel="noopener noreferrer nofollow" className="button">
                                      <span style={{ width: '40px', height: '40px', marginRight: '5px', backgroundColor: '#3a589d', borderRadius: '30px', textAlign: 'center', padding: '9px' }}>
                                          <FaFacebookF size={20} />
                                      </span>
                                  </a>
                                  <a href="https://twitter.com/GOGALearn2earn" target="_blank"
                                      rel="noopener noreferrer nofollow" className="button circle">
                                      <span style={{ width: '40px', height: '40px', marginRight: '5px', backgroundColor: '#2478ba', borderRadius: '30px', textAlign: 'center', padding: '9px' }}>
                                          <FaTwitter size={20} />
                                        </span>
                                  </a>
                                  <a href="https://t.me/gogal2eofficial" target="_blank"
                                      rel="noopener noreferrer nofollow" className="button circle">
                                       <span style={{ width: '40px', height: '40px', marginRight: '5px', backgroundColor: '#54a9ea', borderRadius: '30px', textAlign: 'center', padding: '9px' }}>
                                          <FaTelegram size={20} />
                                          </span>
                                  </a>
                                  <a href="https://discord.gg/M6ryBZaKea" target="_blank"
                                      rel="noopener noreferrer nofollow" className="button circle">
                                      <span style={{ width: '40px', height: '40px', marginRight: '5px', backgroundColor: '#7189d9', borderRadius: '30px', textAlign: 'center', padding: '9px' }}>
                                          <FaDiscord size={20} />
                                        </span>
                                  </a>
                              </div>
                          </div>

                          <div className="col-6 col-lg-12">
                              <h4 className="uppercase medium-text-center">Free DOWNLOAD</h4>
                              <p><a className=""
                                    href="https://apps.apple.com/us/app/goga-arena-of-english/id1603168534">
                                  <img width="119" height="47"
                                       src="https://goga.ai/wp-content/uploads/2022/02/56-image-App-Store.png"
                                       className="attachment-large size-large" alt=""/></a></p>
                              <p><a className=""
                                    href="https://play.google.com/store/apps/details?id=com.x3english.goga">
                                  <img width="119" height="47"
                                       src="https://goga.ai/wp-content/uploads/2022/02/57-image-Google-Play.png"
                                       className="attachment-large size-large" alt="" />
                              </a></p>

                          </div>

                      </div>


                  </div>
              </div>
          </div>
      </footer>
  )
}

export default Footer
