import {Anchor, Button, Group, Paper, PasswordInput, Stack, Text, TextInput} from '@mantine/core';
import type { PaperProps } from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useEffect } from 'react';
import { UseAuth } from '../context/AuthProvider';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

interface AuthenticationProps extends PaperProps {
  initType: 'login' | 'register'
  onClose: () => void
}

export function AuthenticationForm({ initType, onClose, ...props}: AuthenticationProps ) {
  const [type, toggle] = useToggle(['login', 'register']);
  const { SignUp, Login } = UseAuth()

  useEffect(() => {
    if (initType !== type) {
      toggle(initType)
    }
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
        notifications.show({
          title: "Account created",
          message: "Signed up successfully",
          color: 'cyan',
          icon: <IconCheck size={18} />,
          withCloseButton: false,
        })
        form.setFieldValue('name', '')
        form.setFieldValue('email', '')
        form.setFieldValue('password', '')
        toggle('login')
      })
      .catch(error => {
        notifications.show({
          title: "Sign up failed",
          message: "There was a problem creating your account",
          color: 'red',
          icon: <IconX size={18} />,
          withCloseButton: false,
        })
        console.log(error)
      })
    }
    else {
      Login({
        user: {
          email: form.values.email,
          password: form.values.password
        }
      })
      .then(() => {
        onClose()
      })
      .catch(error => {
        notifications.show({
          title: "Login failed",
          message: "Check your credentials",
          color: 'red',
          icon: <IconX size={18} />,
          withCloseButton: false,
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

      <form onSubmit={form.onSubmit(() => {
        handleSubmit()
      })}>
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
          <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
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