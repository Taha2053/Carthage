// CarthaVillage — App shell, wires up navigation and screens
const { useState } = React;

function App() {
  const [active, setActive] = useState('landing');

  // Scroll to top on screen change
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [active]);

  const screens = {
    landing:     window.ScreenLanding,
    dashboard:   window.ScreenDashboard,
    institution: window.ScreenInstitution,
    teacher:     window.ScreenTeacher,
    student:     window.ScreenStudent,
    handoff:     window.ScreenHandoff,
  };
  const Active = screens[active] || screens.landing;

  return (
    <div data-screen-label={active}>
      <TopNav active={active} setActive={setActive} />
      <Active setActive={setActive} />
      <Footer/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
