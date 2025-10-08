import type {PaperProps} from '@mantine/core';
import {Anchor, Button, Group, Paper, PasswordInput, Stack, Text, TextInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {upperFirst} from '@mantine/hooks';
import {useEffect, useState} from 'react';
import {UseAuth} from '../context/AuthProvider';
import { SuccessNotification } from './SuccessNotification';

interface AuthenticationProps extends PaperProps {
    initType: 'login' | 'register'
    onClose: () => void
}

export function AuthenticationForm({initType, onClose, ...props}: AuthenticationProps) {
    const [type, setType] = useState<'login' | 'register'>(initType);
    const {SignUp, Login} = UseAuth()

    const toggleType = (next?: 'login' | 'register') => {
        if (next) {
            setType(next);
            return;
        }

        setType((current) => (current === 'login' ? 'register' : 'login'));
    };

    useEffect(() => {
        setType(initType);
    }, [initType]);

    const form = useForm({
        initialValues: {
            email: '',
            name: '',
            password: '',
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length < 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handleSubmit = async () => {
        if (type === 'register') {
            SignUp({
                user: {
                    username: form.values.name,
                    email: form.values.email,
                    password: form.values.password
                }
            })
                .then(() => {
                    SuccessNotification({
                        success: true,
                        notifTitle: "Account created",
                        notifMessage: "Signed up successfully"
                    })
                    form.setFieldValue('name', '')
                    form.setFieldValue('email', '')
                    form.setFieldValue('password', '')
                    toggleType('login')
                })
                .catch(error => {
                    SuccessNotification({
                        success: false,
                        notifTitle: "Sign up failed",
                        notifMessage: "There was a problem creating your account"
                    })
                    console.log(error)
                })
        } else {
            Login({
                user: {
                    email: form.values.email,
                    password: form.values.password
                }
            })
                .then(() => {
                    SuccessNotification({
                        success: true,
                        notifTitle: "Login successful",
                        notifMessage: "Welcome back"
                    })
                    onClose()
                })
                .catch(error => {
                    SuccessNotification({
                        success: false,
                        notifTitle: "Login failed",
                        notifMessage: "Check your credentials"
                    })
                    console.log(error)
                })
        }
    }

    return (
        <Paper radius="md" p="lg" withBorder {...props}>
            <Text size="lg" fw={500}>
                Welcome to Movie App, {type} with
            </Text>

            <form
                onSubmit={form.onSubmit(() => {
                    handleSubmit()
                })}
            >
                <Stack>
                    {type === 'register' && (
                        <TextInput
                            label="Name"
                            placeholder="Your username"
                            value={form.values.name}
                            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                            radius="md"
                        />
                    )}

                    <TextInput
                        required
                        label="Email"
                        placeholder="Your email address"
                        value={form.values.email}
                        onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                        error={form.errors.email && 'Invalid email'}
                        radius="md"
                    />

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        value={form.values.password}
                        onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                        error={form.errors.password && 'Password should include at least 6 characters'}
                        radius="md"
                    />


                </Stack>

                <Group justify="space-between" mt="xl">
                    <Anchor component="button" type="button" c="dimmed" onClick={() => toggleType()} size="xs">
                        {type === 'register'
                            ? 'Already have an account? Login'
                            : "Don't have an account? Register"}
                    </Anchor>
                    <Button type="submit" radius="xl">
                        {upperFirst(type)}
                    </Button>
                </Group>
            </form>
        </Paper>
    );
}
