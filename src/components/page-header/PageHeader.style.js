let logoWidth = 140;

const styles = theme => ({
  header: {
    padding: 0,
    background: theme.color.background
  },
  MyAccount: {
    color: '#00b46e',
    fontWeight: 700,
    paddingTop: '36px',
    paddingBottom: '36px',
    float: 'right'
  },

  AddAdvertWrappper: {
    paddingTop: '36px',
    paddingBottom: '36px',
    float: 'right'
  },

  MenuItem: {
    borderTop: '2px solid transparent',
    paddingTop: '36px',
    paddingBottom: '36px',
    textAlign: 'center',
    '& a': {
      color: 'rgba(42, 51, 116, 0.6)'
    }
  },
  logoMenuItem: {
    paddingTop: 27,
    paddingBottom: 31
  },
  logo: {
    height: 60,
    width: 50
  },
  title: {
    color: theme.color.darkGreen,
    fontWeight: 600,
    fontSize: 24,
    textDecoration: 'none',
    marginLeft: 20
  },
  logoWrapper: {
    width: logoWidth
  },
  menuWrapper: {
    width: `calc(100% - ${logoWidth}px - 30px)`,
    display: 'block',
    boxSizing: 'border-box',
    marginLeft: 30
  }
});

export default styles;
