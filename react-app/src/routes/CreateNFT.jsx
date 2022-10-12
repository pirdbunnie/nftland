import React, { useState } from "react";
import {
    Center,
    Flex,
    Box,
    Input,
    Button,
    HStack,
    Text,
    Textarea,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
    Tooltip,
    useToast
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { useAccountContext } from "../contexts/Account";
import NumberInput from "../components/NumberInput";
import { TestUpload } from "../utils/ServerApi";


const CreateNFT = () => {
    const toast = useToast();
    const { account } = useAccountContext();
    const [name, setName] = useState('');
    const [nameInvalid, setNameInvalid] = useState(false);
    const [desc, setDesc] = useState('');
    const [descInvalid, setDescInvalid] = useState(false);
    const [inputFile, setInputFile] = useState(null);
    const [fileInvalid, setFileInvalid] = useState(false);
    const [totalSupply, setTotalSupply] = useState('');
    const [totalSupplyInvalid, setTotalSupplyInvalid] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    console.log("env NODE_ENV", process.env.NODE_ENV);

    const showErrorToast = (title, errorMessage) => {
        toast({
            title: title,
            description: errorMessage,
            duration: 1500,
            status: 'error',
            isClosable: false,
            position: 'top'
        })
    }
    const onChangeName = e => {
        setNameInvalid(false);
        setErrorMessage("");
        setName(e.target.value);
    }
    const onChangeDesc = e => {
        setDescInvalid(false);
        setErrorMessage("");
        setDesc(e.target.value);
    }
    const onChangeFile = e => {
        setFileInvalid(false);
        setErrorMessage("");
        setInputFile(e.target.files[0]);
    }
    const onChangeTotalSupply = val => {
        setTotalSupplyInvalid(false);
        setErrorMessage("");
        setTotalSupply(val);
    }
    const onClickCreate = async e => {
        if (!account) {
            showErrorToast("not login");
            return;
        }
        if (!name) {
            setNameInvalid(true);
            setErrorMessage("name is required");
            return
        }
        if (!desc) {
            setDescInvalid(true);
            setErrorMessage("description is required");
            return
        }
        if (!inputFile) {
            setFileInvalid(true);
            setErrorMessage("image is required");
            return
        }
        const t = Number(totalSupply);
        if(isNaN(t) || t <= 0) {
            setTotalSupplyInvalid(true);
            setErrorMessage("totalSupply must be greater than zero");
            return
        }
        await TestUpload(inputFile);
    }

    // const createModeTips = "Sit nulla est ex deserunt exercitation anim occaecat. Nostrud ullamco deserunt aute id consequat veniam incididunt duis in sint irure nisi. Mollit officia cillum Lorem ullamco minim nostrud elit officia tempor esse quis.Sunt ad dolore quis aut"

    const createModeTips = (
        <Box>
            <Text>{"It's a lazy minting which only occurs when someone buys an item from you. "}</Text>
            <Text>
                {"This means that you can create NFT for free"}
            </Text>
        </Box>
    )

    return (
        <Center pt="10px">
            <Box w="400px" minH="200px">
                <Text fontSize="xl" align="center">Create NFT</Text>
                <FormControl isRequired>
                    <FormLabel>NFT Name</FormLabel>
                    <Input value={name} isInvalid={nameInvalid} onChange={onChangeName} />
                    <Box h="5px"></Box>
                    <FormLabel>NFT Description</FormLabel>
                    <Textarea value={desc} isInvalid={descInvalid} onChange={onChangeDesc} />
                    <Box h="5px"></Box>
                    <FormLabel>Upload Image</FormLabel>
                    <Input type="file" onChange={onChangeFile} isInvalid={fileInvalid} accept="image/*" />
                    {
                        errorMessage ? <Text color="red.500" fontSize="lg">{errorMessage}</Text> : null
                    }
                    <FormLabel>Total Supply</FormLabel>
                    <NumberInput value={totalSupply} onChange={onChangeTotalSupply} isInvalid={totalSupplyInvalid} />
                    <Box h="5px"></Box>
                    <Flex>
                        {"create is free"}
                        <Box w="5px"></Box>
                        <Center>
                        <Tooltip hasArrow label={createModeTips} placement="top">
                            <InfoOutlineIcon />
                        </Tooltip>
                        </Center>
                    </Flex>
                    <Box h="10px"></Box>
                    <Center><Button size="lg" colorScheme="purple" onClick={onClickCreate}>Create</Button></Center>
                </FormControl>
            </Box>
        </Center>
    )
};

export default CreateNFT;
