import { Paper, Text, Anchor, Group, Button } from "@mantine/core";

interface ConfirmationWindowProps {
  result: (confirmed: boolean) => void
}

export function ConfirmationWindow({ result }: ConfirmationWindowProps) {
    return (
        <>
            
            <Text ta="center" size="lg" fw={500}>
                Are your sure?
            </Text>

            <Group justify="space-between" mt="xl">
            <Button radius="xl" onClick={() => result(false)}>
                Cancel
            </Button>
            <Button radius="xl" onClick={() => result(true)}>
                Yes
            </Button>
            </Group>
        </>
  );
}