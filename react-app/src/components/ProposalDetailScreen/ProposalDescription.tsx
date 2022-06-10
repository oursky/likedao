import React, { useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import cn from "classnames";
import { toast } from "react-toastify";
import rehypeSanitize from "rehype-sanitize";
import Paper from "../common/Paper/Paper";
import IconButton from "../common/Buttons/IconButton";
import { IconType } from "../common/Icons/Icons";
import { useClipboard } from "../../hooks/useClipboard";
import { useLocale } from "../../providers/AppLocaleProvider";
import { Proposal } from "../../generated/graphql";
import useShare from "../../hooks/useShare";

const ProposalDescription: React.FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const copy = useClipboard();
  const { translate } = useLocale();
  const { share, canShare } = useShare();

  const handleClickShare = useCallback(() => {
    share({
      title: document.title,
      text: window.location.href, // TODO: change to update document.title to proposal title and use here
      url: window.location.href,
    }).catch((err) => {
      console.error("Failed to share =", err);
    });
  }, [share]);

  const handleCopyLink = useCallback(() => {
    copy(window.location.href)
      .then(() => {
        toast.success(translate("UserInfoPanel.addressCopied"));
      })
      .catch((err) => {
        console.error(`Failed to copy text = `, err);
      });
  }, [copy, translate]);

  return (
    <Paper>
      <MDEditor.Markdown
        className={cn("!text-black", "font-medium")}
        source={proposal.description}
        rehypePlugins={[[rehypeSanitize]]}
      />
      <div className={cn("flex", "justify-end", "mt-6", "text-right")}>
        {canShare ? (
          <IconButton
            icon={IconType.Share}
            size={24}
            title="Share"
            tooltip={translate("ProposalDetail.share")}
            onClick={handleClickShare}
          />
        ) : (
          <IconButton
            icon={IconType.Link}
            size={24}
            title="Copy link"
            tooltip={translate("ProposalDetail.copyLink")}
            onClick={handleCopyLink}
          />
        )}
      </div>
    </Paper>
  );
};

export default ProposalDescription;
