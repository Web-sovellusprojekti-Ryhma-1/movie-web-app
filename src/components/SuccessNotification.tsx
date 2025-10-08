import { notifications } from "@mantine/notifications"
import { IconCheck, IconX } from "@tabler/icons-react"

interface notifTypes {
    success: boolean
    notifTitle: string
    notifMessage: string
}

export const SuccessNotification = ({ success, notifTitle, notifMessage }: notifTypes) => {
    notifications.show({
        title: notifTitle,
        message: notifMessage,
        color: success ? 'cyan' : 'red',
        icon: success ? <IconCheck size={18} /> : <IconX size={18} />,
        withCloseButton: false,
    });
};
