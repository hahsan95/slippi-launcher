/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import styled from "@emotion/styled";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import WarningIcon from "@material-ui/icons/Warning";
import { colors } from "common/colors";
import React from "react";
import { useForm } from "react-hook-form";

import { ExternalLink as A } from "@/components/ExternalLink";
import { Toggle } from "@/components/FormInputs/Toggle";
import { PathInput } from "@/components/PathInput";

type FormValues = {
  ipAddress: string;
  port: number;
  folderPath: string;
  isRealTimeMode: boolean;
  obsIP?: string;
  obsSourceName?: string;
  obsPassword?: string;
};

export interface AddConnectionFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
}

export const AddConnectionForm: React.FC<AddConnectionFormProps> = ({ defaultValues, onSubmit }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });
  const ipAddress = watch("ipAddress");
  const folderPath = watch("folderPath");
  const isRealTimeMode = watch("isRealTimeMode");
  const obsIP = watch("obsIP");
  const obsPassword = watch("obsPassword");
  const obsSourceName = watch("obsSourceName");

  const onFormSubmit = handleSubmit(onSubmit);

  return (
    <Outer>
      <form className="form" onSubmit={onFormSubmit}>
        <section>
          <TextField
            label="IP Address"
            value={ipAddress}
            onChange={(e) => setValue("ipAddress", e.target.value)}
            required={true}
          />
        </section>

        <section>
          <SettingDescription label="Target Folder">The folder to save SLP files to.</SettingDescription>
          <PathInput
            value={folderPath}
            onSelect={(newPath) => setValue("folderPath", newPath)}
            placeholder="No folder selected"
            options={{
              properties: ["openDirectory"],
            }}
          />
          <FormHelperText error={Boolean(errors?.folderPath)}>{errors?.folderPath?.message}</FormHelperText>
        </section>
        <section>
          <Toggle
            value={Boolean(isRealTimeMode)}
            onChange={(checked) => setValue("isRealTimeMode", checked)}
            label="Real-time Mode"
            description="When enabled, prevents delay from accumulating when mirroring. Keep this off unless both the Wii and computer are on a wired LAN connection."
          />
        </section>

        <div
          css={css`
            margin-bottom: 20px;
          `}
        >
          <Button
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
            color="secondary"
            css={css`
              text-transform: initial;
              margin-bottom: 5px;
            `}
          >
            {showAdvanced ? "Hide" : "Show"} advanced options
          </Button>
          <Collapse
            in={showAdvanced}
            css={css`
              padding-left: 20px;
              padding-bottom: 10px;
              border-left: solid 3px ${colors.purpleLight};
            `}
          >
            <Notice>
              <WarningIcon />
              Only modify these values if you know what you're doing.
            </Notice>
            <SettingDescription
              label="Autoswitcher"
              css={css`
                margin-bottom: 10px;
              `}
            >
              <span
                css={css`
                  a {
                    text-decoration: underline;
                  }
                `}
              >
                Enables automatic hiding and showing of an OBS source (e.g. your Dolphin capture) when the game is
                active. Requires <A href="https://github.com/Palakis/obs-websocket">OBS Websocket Plugin</A>.
              </span>
            </SettingDescription>
            <div
              css={css`
                display: grid;
                grid-gap: 10px;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                margin-bottom: 10px;
              `}
            >
              <TextField
                label="OBS Websocket IP:Port"
                value={obsIP ?? ""}
                required={showAdvanced}
                onChange={(e) => setValue("obsIP", e.target.value)}
              />
              <TextField
                label="OBS Password"
                value={obsPassword ?? ""}
                onChange={(e) => setValue("obsPassword", e.target.value)}
                type="password"
              />
            </div>
            <TextField
              label="OBS Source Name"
              value={obsSourceName ?? ""}
              required={showAdvanced}
              onChange={(e) => setValue("obsSourceName", e.target.value)}
            />
          </Collapse>
        </div>

        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </Outer>
  );
};

const Outer = styled.div`
  form section {
    margin-bottom: 15px;
  }
`;

const SettingDescription: React.FC<{ label: string; className?: string }> = ({ className, label, children }) => {
  return (
    <div
      className={className}
      css={css`
        margin-bottom: 5px;
      `}
    >
      <Typography variant="body1">{label}</Typography>
      <Typography variant="caption">{children}</Typography>
    </div>
  );
};

const Notice = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.3);
  color: #bbb;
  border-radius: 10px;
  svg {
    padding: 5px;
    margin-right: 5px;
  }
  margin-bottom: 20px;
`;