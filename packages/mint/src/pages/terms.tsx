import { Box, Container, makeStyles, Paper } from '@material-ui/core'
import React from 'react'
import { MainLayout } from '../layouts'
import { AppHeader, Footer, HeroCard } from '../ui'
import { Markdown } from '../modules'
import { PrivacyMd } from '../content'
import { config } from '../libs'

const t = {
    title: 'Terms Of Service',
    subtitle: config.company,
    backgroundImage: '',
}

const useStyles = makeStyles((theme) => ({
    content: {
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.default,
    },
    left: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    right: {
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
}))

const TermsPage = () => {
    const classes = useStyles()
    return (
        <MainLayout
            classes={{
                left: classes.left,
                right: classes.right,
            }}
            containerProps={{}}
            top={
                <HeroCard
                    data={{
                        title: t.title,
                        subtitle: t.subtitle,
                        backgroundImage: t.backgroundImage,
                    }}
                />
            }
            header={<AppHeader />}
            footer={<Footer />}
        >
            <Paper className={classes.content}>
                <Container>
                    <Box pt={3.2} pb={3.2}>
                        <Markdown>{PrivacyMd}</Markdown>
                    </Box>
                </Container>
            </Paper>
        </MainLayout>
    )
}

export default TermsPage
