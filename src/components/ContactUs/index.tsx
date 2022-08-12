import imageWebsite from '../../img/contact-us/website.png';
import imagePhone from '../../img/contact-us/phone.png';
import imageEmail from '../../img/contact-us/email.png';
import imageDiscord from '../../img/contact-us/discord.png';

const ContactUs = () => {
    return (
        <div className="container contactus py-5">
            <div className="row justify-content-center mb-5">
                <div className="col-lg-6 text-center">
                    <h2 className="text-pink mb-4">How can we help?</h2>
                    <div className="link mb-2"><p className="link-light">Have a question? </p></div>
                    <div className="link mb-2"><p className="link-light">Need help? </p></div>
                    <div className="link mb-4"><p className="link-light"><strong>Contact Us</strong></p></div>
                            
                    <a target='_blank' href="https://discord.gg/ZDRVawyE" className="button fluid"><img src={imageDiscord} alt="discord" /></a>
                            
                    <p>Or get more information from <a className="link-info" href="https://goga.ai/faqs/ ">https://goga.ai/faqs/ </a></p>
                </div>
            </div>

            <div className="row links">
                <div className="col-md-4">
                    <div className="box-icon">
                        <a className="link-light" href="tel:1900 633 321"><img src={imagePhone} alt="" /> 1900 633 321</a>
                    </div>
                </div>
                <div className="col-md-4 text-center">
                    <div className="box-icon">
                        <a className="link-light" href="https://goga.ai/"><img src={imageWebsite} alt="" /> www.goga.ai</a>
                    </div>
                </div>
                <div className="col-md-4 text-right">
                    <div className="box-icon">
                        <a className="link-light" href="mailto:support@goga.ai"><img src={imageEmail} alt="" /> support@goga.ai</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactUs