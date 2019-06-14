const styles = {
  MenuItem: {
    listStyle: 'none',
    color: '#c7e1e0',
    opacity: '07',
    margin: '15px 100px 15px 0',
    padding: 3,
    '&:hover': {
      cursor: 'pointer',
      color: 'teal',
      transitionDuration: '0.2s'
    }
  },

  FooterInfo: {
    color: '#c7e1e0',
    opacity: '0.2'
  },

  FooterDivider: {
    opacity: '0.2',
    marginBottom: 34,
    background: '#c7e1e0'
  },

  FooterLinks: {
    height: 210,
    marginTop: 40
  },
  wrapper: {
    backgroundColor: '#004e4d',
    backgroundImage: `linear-gradient(135deg, #006867 28%,#004949 79%)`,
    height: 390,
    paddingLeft: 0,
    paddingRight: 0,
    '& ul': {
      paddingLeft: 0
    }
  }
};

export default styles;
