import { CSSProperties, FC, MouseEvent, ReactElement } from 'react';

export interface ButtonProps {
    className?: string;
    disabled?: boolean;
    endIcon?: ReactElement;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    startIcon?: ReactElement;
    style?: CSSProperties;
    tabIndex?: number;
    isButton?: boolean
}



export const Button: FC<ButtonProps> = (props) => {
    const justifyContent = props.endIcon || props.startIcon ? 'space-between' : 'center';
    return (
        <button
            className={`wallet-adapter-button ${props.className || ''}`}
            disabled={props.disabled}
            onClick={props.onClick}
            style={{ justifyContent, backgroundImage: 'none', ...props.style }}
            tabIndex={props.tabIndex || 0}
            type="button"
        >
            {/* {props.startIcon && <i className="wallet-adapter-button-start-icon">{props.startIcon}</i>} */}
            {props.endIcon && <i style={{ marginRight: '10px' }}>{props.endIcon}</i>}
            {props.children}
        </button>
    );
};
