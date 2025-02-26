/* eslint-disable react/no-unescaped-entities */
/* eslint-disable dot-notation */
import React, { useEffect, useRef } from 'react'
import * as Yup from 'yup'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Link from '@material-ui/core/Link'

import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { Checkbox, FormHelperText, Paper } from '@material-ui/core'
import { useFormik } from 'formik'
import { Logo } from '../../ui/Logo'

import {
    config,
    login,
    useAuthDispatch,
    useVerifyGoogleLogin,
    updateSnackBar,
    useGlobalDispatch,
    useUserEmailSignUp,
    IErrorResponse,
} from '../../libs'
import { useRouter } from 'next/router'

const SignUpSchema = Yup.object().shape({
    tos: Yup.boolean().isTrue('Agreement is required for signup.'),
    name: Yup.string()
        .required('Full name is required.')
        .min(3, 'Name is too short - should be 3 chars minimum.'),
    email: Yup.string().required('Email is required.').email('Invalid email'),
    password: Yup.string()
        .required(
            'Password is required. Password has to be at least 8 characters and less than 64 characters.'
        )
        .min(8, 'Password is too short - should be 8 chars minimum.')
        .max(64, 'Password is too Long - should be 64 chars maximum.'),
})

const useStyles = makeStyles((theme) => ({
    root: {
        backdropFilter: 'blur(50px)',
    },
    header: {},
    paper: {
        height: '100%',
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        boxShadow: '0 4px 16px rgb(0 0 0 / 15%)',
    },
    footer: {
        maxWidth: 400,
        padding: '12px 0 24px 0',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        textAlign: 'center',
        justifyContent: 'center',
    },
    links: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
        margin: '24px 0 0 0',
        textAlign: 'center',
    },
    link: {
        ...theme.typography.caption,
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        textAlign: 'left',
        paddingTop: 24,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        margin: '0',
        width: '100%',
        height: '100%',
        padding: theme.spacing(2, 4.0, 4, 4.0),
    },
    title: {
        textAlign: 'center',
    },
    divider: {
        marginTop: 12,
        marginBottom: 12,
        position: 'relative',
        width: '100%',
        textAlign: 'center',
        '&:before': {
            background:
                'linear-gradient(to right, #4f44e0 0%, transparent 40%, transparent 60%, #4f44e0 100%)',
            content: "''",
            display: 'block',
            height: 1,
            position: 'absolute',
            top: 8,
            width: '100%',
        },
    },
    illustration: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    form: {
        width: '100%',
    },
    submit: {
        margin: theme.spacing(1, 0, 1, 0),
    },
    authProviders: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

export function SignUp() {
    const classes = useStyles()
    const emailSignup = useUserEmailSignUp()
    const authDispatch = useAuthDispatch()
    const globalDispatch = useGlobalDispatch()
    const verifyGoogleLogin = useVerifyGoogleLogin()
    const googleBtnRef = useRef()
    const router = useRouter()
    const {
        values,
        isValid,
        setErrors,
        touched,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
    } = useFormik({
        initialValues: {
            tos: true,
            name: '',
            email: '',
            password: '',
        },
        validationSchema: SignUpSchema,
        onSubmit: function (data) {
            emailSignup.mutate(
                {
                    clientId:
                        (router.query['client_id'] as string) ||
                        config.clientId,
                    redirectUri:
                        (router.query['redirect_uri'] as string) ||
                        config.callbackUrl,
                    name: data.name,
                    email: data.email,
                    password: data.password,
                },
                {
                    onSuccess: (response) => {
                        globalDispatch(
                            updateSnackBar({
                                message: 'Signed Up Successfully',
                                type: 'success',
                                open: true,
                            })
                        )

                        authDispatch(
                            login({
                                access_token: response.data.access_token,
                                refresh_token: response.data.refresh_token,
                            })
                        )
                    },
                    onError: (error: IErrorResponse<any>) => {
                        globalDispatch(
                            updateSnackBar({
                                message: error.errors[0].message,
                                type: 'error',
                                open: true,
                            })
                        )

                        setErrors({
                            password: error.errors[0].message,
                        })
                    },
                }
            )
        },
    })

    useEffect(() => {
        function initializeGoogleLogin() {
            const google = window['google']
            google.accounts.id.initialize({
                client_id: config.googleOAuthOptions.clientID,
                ux_mode: 'popup',
                callback: function handleCredentialResponse(response) {
                    verifyGoogleLogin
                        .mutateAsync({
                            ...response,
                            clientId:
                                (router.query['client_id'] as string) ||
                                config.clientId,
                            redirectUri:
                                (router.query['redirect_uri'] as string) ||
                                config.callbackUrl,
                        })
                        .then((response) => {
                            authDispatch(
                                login({
                                    access_token: response.data['access_token'],
                                    refresh_token:
                                        response.data['refresh_token'],
                                })
                            )
                        })
                        .catch(console.error)
                },
            })
            google.accounts.id.renderButton(googleBtnRef.current, {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
            })
            google.accounts.id.prompt()
        }

        if (window['google']) {
            initializeGoogleLogin()
        }
    }, [googleBtnRef.current])

    const footerLinks = [
        {
            to: '/terms',
            label: 'Terms',
        },
        {
            to: '/privacy',
            label: 'Privacy',
        },
        {
            to: '/resources',
            label: 'Resources',
        },
    ]

    return (
        <Grid container alignContent="center" justify="center">
            <Grid container item alignContent="center" justify="center">
                <Paper className={classes.paper} component="section">
                    <Box className={classes.container}>
                        <Grid item className={classes.header}>
                            <Box display="flex" className={classes.logo}>
                                <Logo />
                            </Box>
                        </Grid>
                        <Box className={classes.content}>
                            <Typography className={classes.title} variant="h6">
                                Let's get you set up
                            </Typography>
                            <form
                                className={classes.form}
                                noValidate
                                autoComplete="pleaseturnoff"
                                onSubmit={handleSubmit}
                            >
                                <input
                                    id="fakeemail"
                                    style={{ display: 'none' }}
                                    type="text"
                                    name="fakeusernameremembered"
                                />
                                <input
                                    id="fakepassword"
                                    style={{ display: 'none' }}
                                    type="password"
                                    name="fakepasswordremembered"
                                />
                                <TextField
                                    label="Your name"
                                    size="small"
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    name="name"
                                    type="text"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.name}
                                    autoComplete="pleaseturnoff"
                                    error={touched.name ? !!errors.name : false}
                                    helperText={touched.name ? errors.name : ''}
                                    placeholder="First & Last Name"
                                />
                                <TextField
                                    label="Email Address"
                                    size="small"
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    name="email"
                                    type="text"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    autoComplete="pleaseturnoff"
                                    value={values.email}
                                    error={
                                        touched.email ? !!errors.email : false
                                    }
                                    helperText={
                                        touched.email ? errors.email : ''
                                    }
                                    placeholder="e.g. email@address.com"
                                />
                                <TextField
                                    label="Password"
                                    size="small"
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    type="password"
                                    id="password"
                                    value={values.password}
                                    autoComplete="new-password"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={
                                        touched.password
                                            ? !!errors.password
                                            : false
                                    }
                                    helperText={
                                        touched.password ? errors.password : ''
                                    }
                                    placeholder="e.g. ••••••••"
                                />
                                <Grid item direction="column">
                                    <Grid
                                        item
                                        alignItems="center"
                                        alignContent="center"
                                    >
                                        <Checkbox
                                            size="small"
                                            name="tos"
                                            checked={values.tos}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFieldValue('tos', true)
                                                } else {
                                                    setFieldValue('tos', false)
                                                }
                                            }}
                                            color="primary"
                                        />
                                        <Typography
                                            style={{ marginLeft: 2 }}
                                            variant="caption"
                                        >
                                            Agreed to{' '}
                                            <Link
                                                href={'/terms'}
                                                variant="caption"
                                                underline={'none'}
                                            >
                                                terms of use
                                            </Link>{' '}
                                            and{' '}
                                            <Link
                                                href={'/privacy'}
                                                variant="caption"
                                                underline={'none'}
                                            >
                                                privacy policy
                                            </Link>
                                            .
                                        </Typography>
                                        <FormHelperText variant="outlined">
                                            <Typography
                                                variant="caption"
                                                color="error"
                                            >
                                                {errors.tos}
                                            </Typography>
                                        </FormHelperText>
                                    </Grid>
                                </Grid>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    size="medium"
                                    disabled={!isValid || emailSignup.isLoading}
                                    className={classes.submit}
                                >
                                    Get Started
                                </Button>
                            </form>
                            <Grid container className={classes.authProviders}>
                                <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    className={classes.divider}
                                >
                                    Or
                                </Typography>
                                <Grid item>
                                    <div
                                        id="google-button"
                                        ref={googleBtnRef}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Paper>
            </Grid>
            <Grid
                item
                container
                className={classes.footer}
                alignContent="center"
            >
                <Grid item>
                    <Typography
                        variant="caption"
                        align="center"
                        style={{ marginRight: 8 }}
                    >
                        Already a user?{' '}
                    </Typography>
                    <Button
                        title="Log In"
                        variant="text"
                        color="primary"
                        onClick={() => {
                            router.push({
                                query: router.query,
                                pathname: '/',
                            })
                        }}
                    >
                        {'Log In'}
                    </Button>
                </Grid>
                <Grid item style={{ width: '100%' }}>
                    <Box className={classes.links}>
                        {footerLinks.map((link) => (
                            <Link
                                key={link.to}
                                className={classes.link}
                                color="textSecondary"
                                href={link.to}
                                underline={'none'}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Grid>
    )
}
