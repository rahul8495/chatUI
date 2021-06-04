import React from "react";

// reactstrap components
import { Container } from "reactstrap";

// core components
import DemoNavbar from "./../components/Navbars/DemoNavbar.jsx";
import CardsFooter from "./../components/Footers/CardsFooter.jsx";

// index page sections
import Hero from "./IndexSections/Hero.jsx";
import Tabs from "./IndexSections/Tabs.jsx";
import Modals from "./IndexSections/Modals.jsx";
import Download from "./IndexSections/Download.jsx";

class Index extends React.Component {
  componentDidMount() {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    this.refs.main.scrollTop = 0;
  }
  render() {
    return (
      <>
        <DemoNavbar />
        <main ref="main">
          <Hero />
          <section className="section section-components">
            <Container>
              <Tabs />
              <Modals />
            </Container>
          </section>
          <Download />
        </main>
        <CardsFooter />
      </>
    );
  }
}

export default Index;
