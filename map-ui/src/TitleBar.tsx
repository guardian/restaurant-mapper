import gRoundelLogo from './Roundel_ white_on_blue_1.svg';
import jayRoundel from './jay_roundel1.png';
import radarLogo from './radar1.svg';

export interface TitleBarProps {
    jayRadarActivated: boolean;
    setJayRadarActivated: (activated: boolean) => any 
}

export function TitleBar(props: TitleBarProps) {
    return <header className="titleBar">
        <img className="guRoundel" src={props.jayRadarActivated ? jayRoundel : gRoundelLogo}/>
        <h1>{props.jayRadarActivated ? "Jay-Radar" : "Restaurant Review Map"}</h1>
        <img
            src={radarLogo}
            className={"radarIcon" + (props.jayRadarActivated ? " activated": "")}
            onClick={() => props.setJayRadarActivated(!props.jayRadarActivated)}
        />
    </header>
}